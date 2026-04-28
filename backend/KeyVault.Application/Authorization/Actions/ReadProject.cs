using KeyVault.Application.Authorization.Capabilities;

namespace KeyVault.Application.Authorization.Actions;

public sealed record ReadProject : IProjectAction
{
	public ProjectCapability RequiredCapability
		=> ProjectCapability.Create(ProjectResource.Project, ProjectPermission.Read);
}