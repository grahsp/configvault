using KeyVault.Application.Authorization.Capabilities;

namespace KeyVault.Application.ConfigItems.BatchExecution.Operations;

public abstract record Operation
{
	public abstract bool RequiresEnvironment { get; }
	public abstract IReadOnlyList<ProjectCapability> RequiredCapabilities { get; }
}
