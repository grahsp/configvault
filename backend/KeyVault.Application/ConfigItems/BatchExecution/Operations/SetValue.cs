using KeyVault.Application.Authorization.Capabilities;

namespace KeyVault.Application.ConfigItems.BatchExecution.Operations;

public sealed record SetValue(Guid ConfigItemId, string Value, uint ExpectedRevision) : Operation
{
	public override bool RequiresEnvironment => true;
	public override IReadOnlyList<ProjectCapability> RequiredCapabilities =>
		[ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Write)];
}
