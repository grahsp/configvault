namespace KeyVault.Application.Abstractions.Messaging;

public interface ICommandDispatcher
{
	Task DispatchAsync(ICommand command, CancellationToken ct = default);
	Task<TResponse> DispatchAsync<TResponse>(ICommand<TResponse> command, CancellationToken ct = default);
}