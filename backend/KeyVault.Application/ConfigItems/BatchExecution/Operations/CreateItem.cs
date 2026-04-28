using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Domain.ConfigItems;

namespace KeyVault.Application.ConfigItems.BatchExecution.Operations;

public sealed record CreateItem(ConfigKey Key, string? InitialValue) : Operation
{
	public override bool RequiresEnvironment => InitialValue is not null;
	public override IReadOnlyList<ProjectCapability> RequiredCapabilities =>
		[ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Write)];
}
