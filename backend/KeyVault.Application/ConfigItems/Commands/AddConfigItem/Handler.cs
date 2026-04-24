using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations;

namespace KeyVault.Application.ConfigItems.Commands.AddConfigItem;

public sealed class Handler(
	IProcessor processor)
	: ICommandHandler<Command, Unit>
{
	public async Task<Unit> HandleAsync(Command command, CancellationToken ct)
	{
		var batch = new BatchRequest([new CreateItem(command.Key, null)]);
		var batchCommand = new ExecuteBatchOperations.Command(command.ProjectId, null, batch);
		await processor.ExecuteAsync(batchCommand, ct);
		
		return Unit.Value;
	}
}
