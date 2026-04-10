using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.Persistence;

namespace KeyVault.Application.Projects.DeleteProject;

public sealed class DeleteProjectCommandHandler(IUserContext user, IProjectRepository repository, IUnitOfWork uow) : ICommandHandler<DeleteProjectCommand, Unit>
{
	public async Task<Unit> HandleAsync(DeleteProjectCommand command, CancellationToken ct)
	{
		var project = await repository.GetByIdAsync(command.Id, ct);
		
		if (project is null)
			return Unit.Value;

		if (project.OwnerId != user.UserId)
			return Unit.Value;

		repository.Remove(project);
		await uow.SaveChangesAsync(ct);

		return Unit.Value;
	}
}