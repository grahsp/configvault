using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Projects.Commands.DeleteProject;

public sealed class Handler(
	IProjectAuthorizationService authorization,
	IProjectRepository repository,
	IUnitOfWork uow)
	: ICommandHandler<Command, Unit>
{
	public async Task<Unit> HandleAsync(Command command, CancellationToken ct)
	{
		var project = await repository.GetByIdAsync(command.Id, ct)
			?? throw new ProjectNotFoundException(command.Id);

		await authorization.EnsureCanAccessAsync(
			ProjectCapability.Create(ProjectResource.Project, ProjectPermission.Delete),
			project,
			ct);

		repository.Remove(project);
		await uow.SaveChangesAsync(ct);

		return Unit.Value;
	}
}
