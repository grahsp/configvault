using System.Diagnostics.CodeAnalysis;
using KeyVault.Domain.Identity;
using KeyVault.Domain.Projects.Exceptions;

namespace KeyVault.Domain.Projects;

public sealed class Project
{
	public Guid Id { get; }

	public string Name { get; private set; } = null!;

	private readonly List<ProjectDataKey> _dataKeys = [];
	public IReadOnlyList<ProjectDataKey> DataKeys => _dataKeys;
	public ProjectDataKey CurrentDataKey =>
		_dataKeys.OrderByDescending(x => x.CreatedAt).First();
	
	private readonly List<Environment> _environments = [];
	public IReadOnlyList<Environment> Environments => _environments;
	
	private readonly List<ProjectMember> _members = [];
	public IReadOnlyList<ProjectMember> Members => _members;
	
	public DateTimeOffset CreatedAt { get; }

	private Project() {}

	public Project(Guid id, string name, EncryptedValue encryptedDataKey, DateTimeOffset now)
	{
		ArgumentNullException.ThrowIfNull(encryptedDataKey);

		Id = id;
		Name = name;

		CreatedAt = now;
		_dataKeys.Add(ProjectDataKey.Create(Id, encryptedDataKey, now));
	}

	public static Project Create(UserId userId, string name, EncryptedValue encryptedDataKey, DateTimeOffset now)
	{
		ArgumentException.ThrowIfNullOrWhiteSpace(name);
		
		var project = new Project(Guid.NewGuid(), name, encryptedDataKey, now);
		project.SetInitialOwner(userId);
		project.SetInitialEnvironments();
		
		return project;
	}

	private void SetInitialOwner(UserId id)
		=> _members.Add(new ProjectMember(Id, id, ProjectRole.Owner));

	private void SetInitialEnvironments()
	{
		_environments.Add(Environment.Create(Id, "development", CreatedAt));
		_environments.Add(Environment.Create(Id, "production", CreatedAt));
	}


	public bool IsMember(UserId id) => TryGetMember(id, out _);
	
	public ProjectMember RequireMember(UserId id)
	{
		return Members.SingleOrDefault(m => m.UserId == id)
		       ?? throw new ProjectMemberNotFoundException();
	}

	public bool TryGetMember(UserId id, [NotNullWhen(true)] out ProjectMember? member)
	{
		member = Members.SingleOrDefault(m => m.UserId == id);
		return member != null;
	}
	
	public void RequireRole(ProjectMember member, ProjectRole requiredRole)
	{
		if (member.Role > requiredRole)
			throw new InsufficientProjectRoleException();
	}

	public void AddMember(UserId userId, ProjectRole role)
	{
		if (role == ProjectRole.Owner)
			throw new InvalidRoleException();
		
		if (IsMember(userId))
			throw new ProjectMemberAlreadyExistsException();
		
		_members.Add(new ProjectMember(Id, userId, role));
	}
	
	public void RemoveMember(UserId userId)
	{
		if (!TryGetMember(userId, out var member))
			return;
		
		if (member.Role == ProjectRole.Owner)
			throw new InvalidRoleException();

		_members.Remove(member);
	}

	public void SetRole(UserId userId, ProjectRole role)
	{
		if (role == ProjectRole.Owner)
			throw new InvalidRoleException();
		var member = RequireMember(userId);

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

	public Environment AddEnvironment(string name, DateTimeOffset now)
	{
		var normalizedName = NormalizeEnvironmentName(name);
		
		ArgumentException.ThrowIfNullOrWhiteSpace(name);
		
		if (EnvironmentExists(normalizedName))
			throw new EnvironmentAlreadyExists(normalizedName);
		
		var environment = Environment.Create(Id, normalizedName, now);
		_environments.Add(environment);
		
		return environment;
	}

	public void RemoveEnvironment(Guid environmentId)
	{
		if (Environments.Count == 1)
			throw new Domain.Exceptions.BusinessRuleViolationException("There must exist at least one environment in a project.");

		if (TryGetEnvironment(environmentId, out var environment))
			_environments.Remove(environment);
	}
}
