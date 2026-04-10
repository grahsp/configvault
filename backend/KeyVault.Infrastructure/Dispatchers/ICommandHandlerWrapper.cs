namespace KeyVault.Infrastructure.Dispatchers;

public interface ICommandHandlerWrapper
{
	Type CommandType { get; }
	Task<object?> HandleAsync(object command, CancellationToken ct);
}