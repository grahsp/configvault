using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Infrastructure.Dispatchers;

internal sealed class CommandHandlerWrapper<TCommand, TResponse>(ICommandHandler<TCommand, TResponse> handler)
	: ICommandHandlerWrapper where TCommand : ICommand<TResponse>
{
	public Type CommandType => typeof(TCommand);

	public async Task<object?> HandleAsync(object command, CancellationToken ct)
		=> await handler.HandleAsync((TCommand)command, ct);
}