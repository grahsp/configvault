namespace KeyVault.Application.Authorization.Actions;

public sealed record DeleteProject : IProjectAction
{
	public ProjectCapability RequiredCapability
		=> ProjectCapability.Create(ProjectResource.Project, ProjectPermission.Delete);
}
