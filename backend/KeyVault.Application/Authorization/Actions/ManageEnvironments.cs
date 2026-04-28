using KeyVault.Application.Authorization.Capabilities;

namespace KeyVault.Application.Authorization.Actions;

public sealed record ManageEnvironments : IProjectAction
{
	public ProjectCapability RequiredCapability
		=> ProjectCapability.Create(ProjectResource.Environment, ProjectPermission.Manage);
}