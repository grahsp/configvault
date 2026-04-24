namespace KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations;

public interface IProcessor
{
	Task ExecuteAsync(Command command, CancellationToken ct);
}
