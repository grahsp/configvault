using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.Invitations.Exceptions;
using KeyVault.Application.Persistence;

namespace KeyVault.Application.Invitations.Commands;

public sealed record RevokeInvitationCommand(Guid ProjectId, Guid InvitationId) : ICommand<Unit>;

public sealed class RevokeInvitationCommandHandler(
	IActorContext actor,
	IProjectAuthorizationService authorization,
	IProjectInvitationRepository invitations,
	IUnitOfWork uow,
	TimeProvider time)
	: ICommandHandler<RevokeInvitationCommand, Unit>
{
	public async Task<Unit> HandleAsync(RevokeInvitationCommand command, CancellationToken ct)
	{
		var userId = actor.RequireUserId();

		await authorization.EnsureCanAccessAsync(
			ProjectCapability.Create(ProjectResource.Invitation, ProjectPermission.Delete),
			command.ProjectId,
			ct);

		var invitation = await invitations.GetByIdAsync(command.InvitationId, ct)
			?? throw new InvitationNotFoundException();

		if (invitation.ProjectId != command.ProjectId)
			throw new InvitationNotFoundException();

		invitation.Revoke(userId, time.GetUtcNow());

		await uow.SaveChangesAsync(ct);

		return Unit.Value;
	}
}
