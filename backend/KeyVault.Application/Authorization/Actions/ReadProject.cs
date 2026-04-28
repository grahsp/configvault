namespace KeyVault.Application.Authorization.Actions;

public sealed record ReadProject : IProjectAction
{
	public ProjectCapability RequiredCapability
		=> ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Read);
}