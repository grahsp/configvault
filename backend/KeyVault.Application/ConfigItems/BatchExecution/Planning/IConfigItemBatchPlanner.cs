using KeyVault.Application.Authentication;
using KeyVault.Application.ConfigItems.BatchExecution.Models;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.ConfigItems.BatchExecution.Planning;

public interface IConfigItemBatchPlanner
{
	Task<PreparedBatch> PrepareAsync(
		IActorContext actor,
		Project project,
		OperationBatch batch,
		CancellationToken ct);
}