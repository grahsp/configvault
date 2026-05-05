using KeyVault.Application.ConfigItems.BatchExecution.Operations;
using KeyVault.Domain.ConfigItems;

namespace KeyVault.Application.ConfigItems.BatchExecution.Planning;

public sealed class ItemMutation(Guid itemId)
{
	public Guid ItemId { get; } = itemId;
	public bool Delete { get; set; }
	public ConfigKey? NewKey { get; set; }
	public SetValue? NewValue { get; set; }
}
