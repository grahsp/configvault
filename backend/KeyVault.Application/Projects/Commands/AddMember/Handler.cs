using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.Exceptions;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Projects.Commands.AddMember;

public class Handler(
	IActorContext actor,
	IProjectAuthorizationService authorization,
	IProjectRepository repository,
	IUnitOfWork uow)
	: ICommandHandler<Command, Unit>
{
	public async Task<Unit> HandleAsync(Command command, CancellationToken ct)
	{
		if (actor.TryGetUserId(out var userId) && command.UserId == userId)
			throw new BusinessRuleViolationException("Cannot add yourself to a project");
		
		var project = await repository.GetByIdAsync(command.ProjectId, ct)
			?? throw new ProjectNotFoundException(command.ProjectId);
		
		await authorization.EnsureCanAccessAsync(
			ProjectCapability.Create(ProjectResource.ProjectMember, ProjectPermission.Manage),
			project,
			ct);
		project.AddMember(command.UserId, ProjectRole.Member);
		await uow.SaveChangesAsync(ct);

		return Unit.Value;
	}
}
