using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.Invitations.Exceptions;
using KeyVault.Application.Persistence;

namespace KeyVault.Application.Invitations.Commands.RevokeInvitation;

public sealed class Handler(
	IActorContext actor,
	IProjectAuthorizationService authorization,
	IProjectInvitationRepository invitations,
	IUnitOfWork uow,
	TimeProvider time)
	: ICommandHandler<Command, Unit>
{
	public async Task<Unit> HandleAsync(Command command, CancellationToken ct)
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