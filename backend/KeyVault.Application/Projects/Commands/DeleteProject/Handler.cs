using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.Exceptions;
using KeyVault.Application.Persistence;

namespace KeyVault.Application.Projects.Commands.DeleteProject;

public sealed class Handler(IUserContext user, IProjectRepository repository, IUnitOfWork uow) : ICommandHandler<Command, Unit>
{
	public async Task<Unit> HandleAsync(Command command, CancellationToken ct)
	{
		var project = await repository.GetByIdAsync(command.Id, ct);

		if (project is null)
			throw new NotFoundException("Project not found");

		project.EnsureCanDelete(user.UserId);

		repository.Remove(project);
		await uow.SaveChangesAsync(ct);

		return Unit.Value;
	}
}