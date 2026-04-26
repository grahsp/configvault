using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects.Exceptions;

namespace KeyVault.Application.Projects.Commands.DeleteProject;

public sealed class Handler(IUserContext actor, IProjectRepository repository, IUnitOfWork uow) : ICommandHandler<Command, Unit>
{
	public async Task<Unit> HandleAsync(Command command, CancellationToken ct)
	{
		var project = await repository.GetByIdAsync(command.Id, ct)
			?? throw new ProjectNotFoundException(command.Id);

		project.EnsureCanDelete(actor.Id);

		repository.Remove(project);
		await uow.SaveChangesAsync(ct);

		return Unit.Value;
	}
}