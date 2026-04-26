using KeyVault.Domain.Actors;

namespace KeyVault.Domain.Projects;

public sealed class ProjectMember
{
	public Guid ProjectId { get; private init; }
	public ActorId UserId { get; private init; } = null!;
	
	public ProjectRole Role { get; private set; }
	
	private ProjectMember() {}

	internal ProjectMember(Guid projectId, Guid userId, ProjectRole role)
	{
		ProjectId = projectId;
		UserId = ActorId.User(userId);
		Role = role;
	}
	
	internal void SetRole(ProjectRole role)
		=> Role = role;
}