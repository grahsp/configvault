namespace KeyVault.Application.Abstractions.Messaging;

public interface IQueryDispatcher
{
	Task<TResponse> DispatchAsync<TResponse>(IQuery<TResponse> query, CancellationToken ct = default);
}