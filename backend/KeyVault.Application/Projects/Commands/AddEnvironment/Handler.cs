using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects.Exceptions;

namespace KeyVault.Application.Projects.Commands.AddEnvironment;

public sealed class Handler(
	IUserContext user,
	IProjectRepository repository,
	IUnitOfWork uow,
	TimeProvider time)
	: ICommandHandler<Command, Unit>
{
	public async Task<Unit> HandleAsync(Command command, CancellationToken ct)
	{
		var project = await repository.GetByIdAsync(command.ProjectId, ct)
			?? throw new ProjectNotFoundException(command.ProjectId);

		project.AddEnvironment(user.UserId, command.EnvironmentName, time.GetUtcNow());
		await uow.SaveChangesAsync(ct);

		return Unit.Value;
	}
}