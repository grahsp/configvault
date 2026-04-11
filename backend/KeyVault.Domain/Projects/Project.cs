using KeyVault.Domain.Exceptions;
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

	public static Project Create(Guid ownerId, string name, DateTimeOffset now)
	{
		ArgumentException.ThrowIfNullOrWhiteSpace(name);
		
		var project = new Project(Guid.NewGuid(), name, now);
		project.AddMember(ownerId, ProjectRole.Owner);
		
		return project;
	}

	public void EnsureCanDelete(Guid userId)
	{
		if (!Members.Any(m => m.UserId == userId && m.Role == ProjectRole.Owner))
			throw new BusinessRuleViolationException("Only the project owner can delete projects");
	}

	public void AddMember(Guid userId, ProjectRole role)
	{
		if (_members.Any(m => m.UserId == userId))
			throw new ProjectMemberAlreadyExistsException("User already member of project");
		
		_members.Add(new ProjectMember(Id, userId, role));
	}
}