using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Projects.Commands;

public sealed record RemoveEnvironmentCommand(Guid ProjectId, Guid EnvironmentId) : ICommand<Unit>;

public sealed class RemoveEnvironmentCommandHandler(
	IProjectAuthorizationService authorization,
	IProjectRepository repository,
	IUnitOfWork uow)
	: ICommandHandler<RemoveEnvironmentCommand, Unit>
{
	public async Task<Unit> HandleAsync(RemoveEnvironmentCommand command, CancellationToken ct)
	{
		var project = await repository.GetByIdAsync(command.ProjectId, ct)
			?? throw new ProjectNotFoundException(command.ProjectId);

		authorization.EnsureCanAccess(
			ProjectCapability.Create(ProjectResource.Environment, ProjectPermission.Manage),
			project);

		project.RemoveEnvironment(command.EnvironmentId);
		await uow.SaveChangesAsync(ct);

		return Unit.Value;
	}
}
