using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Invitations.Commands.RevokeInvitation;

namespace KeyVault.Api.Invitations.RevokeInvitation;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(ICommandDispatcher dispatcher, Guid projectId, Guid invitationId, CancellationToken ct)
	{
		var command = new Command(projectId, invitationId);
		await dispatcher.DispatchAsync(command, ct);

		return Results.Ok();
	}
}
