namespace KeyVault.Application.Authorization.Actions;

public sealed record ManageProjectMembers : IProjectAction
{
	public ProjectCapability RequiredCapability
		=> ProjectCapability.Create(ProjectResource.ProjectMember, ProjectPermission.Manage);
}