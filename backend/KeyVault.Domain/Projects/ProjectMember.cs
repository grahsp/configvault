namespace KeyVault.Domain.Projects;

public sealed class ProjectMember
{
	public Guid ProjectId { get; private init; }
	public Guid UserId { get; private init; }
	
	public ProjectRole Role { get; private set; }
	
	private ProjectMember() {}

	internal ProjectMember(Guid projectId, Guid userId, ProjectRole role)
	{
		ProjectId = projectId;
		UserId = userId;
		Role = role;
	}
	
	internal void SetRole(ProjectRole role)
		=> Role = role;
}