using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.Exceptions;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Projects.Commands.RemoveMember;

public class Handler(
	IActorContext actor,
	IProjectAuthorizationService authorization,
	IProjectRepository repository,
	IUnitOfWork uow)
	: ICommandHandler<Command, Unit>
{
	public async Task<Unit> HandleAsync(Command command, CancellationToken ct)
	{
		if (actor.TryGetUserId(out var userId) && command.TargetUserId == userId)
			throw new BusinessRuleViolationException("Cannot remove yourself from a project");
		
		var project = await repository.GetByIdAsync(command.ProjectId, ct)
		    ?? throw new ProjectNotFoundException(command.ProjectId);
		
		await authorization.EnsureCanAccessAsync(
			ProjectCapability.Create(ProjectResource.ProjectMember, ProjectPermission.Manage),
			project,
			ct);
		project.RemoveMember(command.TargetUserId);
		await uow.SaveChangesAsync(ct);
		
		return Unit.Value;
	}
}
