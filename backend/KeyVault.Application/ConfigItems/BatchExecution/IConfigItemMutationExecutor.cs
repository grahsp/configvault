using KeyVault.Application.ConfigItems.BatchExecution.Models;

namespace KeyVault.Application.ConfigItems.BatchExecution;

public interface IConfigItemMutationExecutor
{
	Task ExecuteAsync(PreparedBatch batch, CancellationToken ct);
}
