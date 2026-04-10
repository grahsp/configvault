using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Infrastructure.Dispatchers;

public sealed class QueryHandlerWrapper<TQuery, TResponse>(IQueryHandler<TQuery, TResponse> handler)
	: IQueryHandlerWrapper where TQuery : IQuery<TResponse>
{
	public Type QueryType => typeof(TQuery);
	
	public async Task<object?> HandleAsync(object command, CancellationToken ct)
		=> await handler.HandleAsync((TQuery)command, ct);
}