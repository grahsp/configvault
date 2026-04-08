namespace KeyVault.Application.Abstractions.Messaging;

public interface ICommandHandler<in TCommand> where TCommand : ICommand
{
	Task HandleAsync(TCommand command, CancellationToken ct);
}