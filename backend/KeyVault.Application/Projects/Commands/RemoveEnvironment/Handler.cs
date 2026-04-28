using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Actions;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Projects.Commands.RemoveEnvironment;

public class Handler(
	IProjectAuthorizationService authorization,
	IProjectRepository repository,
	IUnitOfWork uow)
	: ICommandHandler<Command, Unit>
{
	public async Task<Unit> HandleAsync(Command command, CancellationToken ct)
	{
		var project = await repository.GetByIdAsync(command.ProjectId, ct)
		    ?? throw new ProjectNotFoundException(command.ProjectId);
		
		await authorization.EnsureCanAccessAsync(new ManageEnvironments(), project, ct);
		project.RemoveEnvironment(command.EnvironmentId);
		await uow.SaveChangesAsync(ct);

		return Unit.Value;
	}
}
