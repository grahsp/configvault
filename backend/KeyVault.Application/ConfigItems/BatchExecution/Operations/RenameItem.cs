using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Domain.ConfigItems;

namespace KeyVault.Application.ConfigItems.BatchExecution.Operations;

public sealed record RenameItem(Guid ConfigItemId, ConfigKey Key) : Operation
{
	public override bool RequiresEnvironment => false;
	public override IReadOnlyList<ProjectCapability> RequiredCapabilities =>
		[ProjectCapability.Create(ProjectResource.ConfigItem, ProjectPermission.Manage)];
}
