namespace KeyVault.Infrastructure.Dispatchers;

public interface IQueryHandlerWrapper
{
	Type QueryType { get; }
	Task<object?> HandleAsync(object command, CancellationToken ct);
}