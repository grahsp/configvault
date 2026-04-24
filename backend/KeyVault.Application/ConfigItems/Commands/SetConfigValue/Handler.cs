using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations;

namespace KeyVault.Application.ConfigItems.Commands.SetConfigValue;

public sealed class Handler(
	IProcessor processor)
	: ICommandHandler<Command, Unit>
{
	public async Task<Unit> HandleAsync(Command command, CancellationToken ct)
	{
		var batch = new BatchRequest([new SetValue(command.ConfigItemId, command.Value)]);
		var batchCommand = new ExecuteBatchOperations.Command(command.ProjectId, command.EnvironmentName, batch);
		await processor.ExecuteAsync(batchCommand, ct);
		
		return Unit.Value;
	}
}
