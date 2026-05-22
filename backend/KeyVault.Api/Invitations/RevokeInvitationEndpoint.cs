using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Invitations.Commands;

namespace KeyVault.Api.Invitations;

internal static class RevokeInvitationEndpoint
{
	internal static async Task<IResult> Handle(ICommandDispatcher dispatcher, Guid projectId, Guid invitationId, CancellationToken ct)
	{
		var command = new RevokeInvitationCommand(projectId, invitationId);
		await dispatcher.DispatchAsync(command, ct);

		return Results.Ok();
	}
}
