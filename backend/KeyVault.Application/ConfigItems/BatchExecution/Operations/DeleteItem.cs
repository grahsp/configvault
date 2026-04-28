using KeyVault.Application.Authorization.Capabilities;

namespace KeyVault.Application.ConfigItems.BatchExecution.Operations;

public sealed record DeleteItem(Guid ConfigItemId) : Operation
{
	public override bool RequiresEnvironment => false;
	public override IReadOnlyList<ProjectCapability> RequiredCapabilities =>
		[ProjectCapability.Create(ProjectResource.ConfigItem, ProjectPermission.Manage)];
}
