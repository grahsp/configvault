using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Projects.Commands;

public sealed record DeleteProjectCommand(Guid Id) : ICommand<Unit>;

public sealed class DeleteProjectCommandHandler(
	IProjectAuthorizationService authorization,
	IProjectRepository repository,
	IUnitOfWork uow)
	: ICommandHandler<DeleteProjectCommand, Unit>
{
	public async Task<Unit> HandleAsync(DeleteProjectCommand command, CancellationToken ct)
	{
		var project = await repository.GetByIdAsync(command.Id, ct)
			?? throw new ProjectNotFoundException(command.Id);

		authorization.EnsureCanAccess(
			ProjectCapability.Create(ProjectResource.Project, ProjectPermission.Delete),
			project);

		repository.Remove(project);
		await uow.SaveChangesAsync(ct);

		return Unit.Value;
	}
}
