using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations;

public sealed class Handler(IProcessor processor) : ICommandHandler<Command, Unit>
{
	public async Task<Unit> HandleAsync(Command command, CancellationToken ct)
	{
		await processor.ExecuteAsync(command, ct);
		return Unit.Value;
	}
}
