using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Infrastructure.Dispatchers;

public class QueryDispatcher(IEnumerable<IQueryHandlerWrapper> handlers) : IQueryDispatcher
{
	private readonly Dictionary<Type, IQueryHandlerWrapper> _handlers =
		handlers.ToDictionary(x => x.QueryType);
	
	public async Task<TResponse> DispatchAsync<TResponse>(IQuery<TResponse> query, CancellationToken ct = default)
	{
		var handler = _handlers[query.GetType()];
		var result = await handler.HandleAsync(query, ct);

		return (TResponse)result!;
	}
}