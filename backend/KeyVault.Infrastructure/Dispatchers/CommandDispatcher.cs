using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Infrastructure.Dispatchers;

public sealed class CommandDispatcher(IEnumerable<ICommandHandlerWrapper> handlers)
	: ICommandDispatcher
{
	private readonly Dictionary<Type, ICommandHandlerWrapper> _handlers =
		handlers.ToDictionary(x => x.CommandType);
	
	public async Task<TResponse> DispatchAsync<TResponse>(ICommand<TResponse> command, CancellationToken ct = default)
	{
		var handler = _handlers[command.GetType()];
		var result = await handler.HandleAsync(command, ct);

		return (TResponse)result!;
	}
}