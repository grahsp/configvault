namespace KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations;

public interface IExecutor
{
	Task ExecuteAsync(ExecutionContext context, BatchRequest batch, CancellationToken ct);
}
