using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.Exceptions;
using KeyVault.Domain.Identity;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Projects.Commands;

public sealed record RemoveMemberCommand(Guid ProjectId, UserId TargetUserId) : ICommand<Unit>;

public sealed class RemoveMemberCommandHandler(
	IActorContext actor,
	IProjectAuthorizationService authorization,
	IProjectRepository repository,
	IUnitOfWork uow)
	: ICommandHandler<RemoveMemberCommand, Unit>
{
	public async Task<Unit> HandleAsync(RemoveMemberCommand command, CancellationToken ct)
	{
		if (actor.TryGetUserId(out var userId) && command.TargetUserId == userId)
			throw new BusinessRuleViolationException("Cannot remove yourself from a project");

		var project = await repository.GetByIdAsync(command.ProjectId, ct)
			?? throw new ProjectNotFoundException(command.ProjectId);

		authorization.EnsureCanAccess(
			ProjectCapability.Create(ProjectResource.ProjectMember, ProjectPermission.Manage),
			project);

		project.RemoveMember(command.TargetUserId);
		await uow.SaveChangesAsync(ct);

		return Unit.Value;
	}
}
