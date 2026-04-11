using System.Diagnostics.CodeAnalysis;
using KeyVault.Domain.Projects.Exceptions;

namespace KeyVault.Domain.Projects;

public sealed class Project
{
	public Guid Id { get; private init; }

	public string Name { get; private set; } = null!;
	
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
		project.AddOwner(userId);
		
		return project;
	}

	private void AddOwner(Guid id)
	{
		if (Members.Count > 0)
			throw new OwnerAlreadyExistsException();
		
		_members.Add(new ProjectMember(Id, id, ProjectRole.Owner));
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
}