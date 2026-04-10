using KeyVault.Application.Abstractions.Messaging;
using Microsoft.Extensions.DependencyInjection;

namespace KeyVault.Infrastructure.Dispatchers;

public sealed class CommandDispatcher(IServiceProvider provider)
	: ICommandDispatcher
{
	public async Task<TResponse> DispatchAsync<TResponse>(ICommand<TResponse> command, CancellationToken ct = default)
	{
		var handlerType = typeof(ICommandHandler<,>)
			.MakeGenericType(command.GetType(), typeof(TResponse));

		dynamic handler = provider.GetRequiredService(handlerType);

		return await handler.HandleAsync((dynamic)command, ct);
	}
}