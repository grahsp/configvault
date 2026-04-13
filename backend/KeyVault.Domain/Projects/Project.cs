using System.Diagnostics.CodeAnalysis;
using KeyVault.Domain.Exceptions;
using KeyVault.Domain.Projects.Exceptions;

namespace KeyVault.Domain.Projects;

public sealed class Project
{
	public Guid Id { get; private init; }

	public string Name { get; private set; } = null!;
	
	private readonly List<Environment> _environments = [];
	public IReadOnlyList<Environment> Environments => _environments;
	
	private readonly List<ProjectMember> _members = [];
	public IReadOnlyList<ProjectMember> Members => _members;
	
	public DateTimeOffset CreatedAt { get; private init; }

	private Project() {}

	public Project(Guid id, string name, DateTimeOffset now)
	{
		Id = id;
		Name = name;

		CreatedAt = now;
	}

	public static Project Create(Guid userId, string name, DateTimeOffset now)
	{
		ArgumentException.ThrowIfNullOrWhiteSpace(name);
		
		var project = new Project(Guid.NewGuid(), name, now);
		project.SetInitialOwner(userId);
		project.SetInitialEnvironments();
		
		return project;
	}

	private void SetInitialOwner(Guid id)
		=> _members.Add(new ProjectMember(Id, id, ProjectRole.Owner));

	private void SetInitialEnvironments()
	{
		_environments.Add(Environment.Create(Id, "development", CreatedAt));
		_environments.Add(Environment.Create(Id, "production", CreatedAt));
	}


	public bool IsMember(Guid id) => TryGetMember(id, out _);
	
	public ProjectMember RequireMember(Guid id)
	{
		return Members.SingleOrDefault(m => m.UserId == id)
		       ?? throw new ProjectMemberNotFoundException();
	}

	public bool TryGetMember(Guid id, [NotNullWhen(true)] out ProjectMember? member)
	{
		member = Members.SingleOrDefault(m => m.UserId == id);
		return member != null;
	}
	
	public void RequireRole(ProjectRole required, ProjectRole actual)
	{
		if (actual > required)
			throw new InsufficientProjectRoleException();
	}
	
	public ProjectMember RequireMemberWithRole(Guid id, ProjectRole role)
	{
		var actor = RequireMember(id);
		RequireRole(role, actor.Role);

		return actor;
	}

	public void EnsureCanDelete(Guid actorId)
		=> RequireMemberWithRole(actorId, ProjectRole.Owner);

	public void AddMember(Guid actorId, Guid userId, ProjectRole role)
	{
		RequireMemberWithRole(actorId, ProjectRole.Admin);

		if (role == ProjectRole.Owner)
			throw new InvalidRoleException();
		
		if (IsMember(userId))
			throw new ProjectMemberAlreadyExistsException();
		
		_members.Add(new ProjectMember(Id, userId, role));
	}
	
	public void RemoveMember(Guid actorId, Guid userId)
	{
		RequireMemberWithRole(actorId, ProjectRole.Admin);
		
		if (!TryGetMember(userId, out var member))
			return;
		
		if (member.Role == ProjectRole.Owner)
			throw new InvalidRoleException();

		_members.Remove(member);
	}

	public void SetRole(Guid actorId, Guid userId, ProjectRole role)
	{
		if (role == ProjectRole.Owner)
			throw new InvalidRoleException();
		
		var actor = RequireMember(actorId);
		var member = RequireMember(userId);
		
		// cannot change the role of members with a greater role
		if (actor.Role >= member.Role)
			throw new InsufficientProjectRoleException();
		
		// cannot set a role higher than the actors role
		if (role < actor.Role)
			throw new InsufficientProjectRoleException();
		
		member.SetRole(role);
	}


	private static string NormalizeEnvironmentName(string name)
		=> name.Trim().ToLowerInvariant();
	
	public bool EnvironmentExists(string normalizedName)
		=> _environments.Any(e => e.Name == normalizedName);
	
	public bool TryGetEnvironment(Guid id, [NotNullWhen(true)] out Environment? environment)
	{
		environment = _environments.SingleOrDefault(e => e.Id == id);
		return environment != null;
	}

	public bool TryGetEnvironment(string name, [NotNullWhen(true)] out Environment? environment)
	{
		var normalizedName = NormalizeEnvironmentName(name);
		environment = _environments.SingleOrDefault(e => e.Name == normalizedName);
		
		return environment != null;
	}

	public Environment AddEnvironment(Guid actorId, string name, DateTimeOffset now)
	{
		var normalizedName = NormalizeEnvironmentName(name);
		
		ArgumentException.ThrowIfNullOrWhiteSpace(name);
		RequireMemberWithRole(actorId, ProjectRole.Admin);
		
		if (EnvironmentExists(normalizedName))
			throw new EnvironmentAlreadyExists(normalizedName);
		
		var environment = Environment.Create(Id, normalizedName, now);
		_environments.Add(environment);
		
		return environment;
	}

	public void RemoveEnvironment(Guid actorId, Guid environmentId)
	{
		RequireMemberWithRole(actorId, ProjectRole.Admin);

		if (Environments.Count == 1)
			throw new BusinessRuleViolationException("There must exist at least one environment in a project.");

		if (TryGetEnvironment(environmentId, out var environment))
			_environments.Remove(environment);
	}
}