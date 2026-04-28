using KeyVault.Application.ConfigItems.BatchExecution.Models;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.ConfigItems.BatchExecution.Planning;

public interface IConfigItemBatchPlanner
{
	Task<PreparedBatch> PrepareAsync(
		Project project,
		OperationBatch batch,
		CancellationToken ct);
}
