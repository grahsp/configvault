using KeyVault.Domain.ConfigItems;

namespace KeyVault.Application.ConfigItems.BatchExecution.Models;

public sealed record CreateItem(ConfigKey Key, string? InitialValue) : Operation
{
	public override bool RequiresEnvironment => InitialValue is not null;
}