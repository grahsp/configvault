using KeyVault.Application.Abstractions.Cryptography;
using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Invitations.Exceptions;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.Invitations;
using KeyVault.Domain.Projects;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Invitations.Commands.AcceptInvitation;

public class Handler(
	IActorContext actor,
	IProjectRepository projects,
	IProjectInvitationRepository invitations,
	ITokenService tokens,
	IUnitOfWork uow,
	TimeProvider time)
	: ICommandHandler<Command, Response>
{
	public async Task<Response> HandleAsync(Command command, CancellationToken ct)
	{
		var userId = actor.RequireUserId();
		
		var now = time.GetUtcNow();
		var token = tokens.HashToken(command.InvitationToken);
		
		var invitation = await invitations.GetByTokenAsync(token, ct)
			?? throw new InvitationNotFoundException();
		
		var project = await projects.GetByIdAsync(invitation.ProjectId, ct)
			?? throw new ProjectNotFoundException(invitation.ProjectId);
		
		invitation.Accept(userId, now);
		project.AddMember(userId, ProjectRole.Member);

		try
		{
			await uow.SaveChangesAsync(ct);
		}
		catch (DbUpdateConcurrencyException ex)
		{
			throw new InvitationAlreadyHandledException(ex);
		}

		return new Response(project.Id);
	}
}
