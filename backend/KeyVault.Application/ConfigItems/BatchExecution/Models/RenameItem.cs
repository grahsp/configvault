using KeyVault.Domain.ConfigItems;

namespace KeyVault.Application.ConfigItems.BatchExecution.Models;

public sealed record RenameItem(Guid ConfigItemId, ConfigKey Key) : Operation
{
	public override bool RequiresEnvironment => false;
}