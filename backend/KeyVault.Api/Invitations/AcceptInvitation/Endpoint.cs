using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Invitations.Commands;

namespace KeyVault.Api.Invitations.AcceptInvitation;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(ICommandDispatcher dispatcher, string token, CancellationToken ct)
	{
		var command = new AcceptInvitationCommand(token);
		var result = await dispatcher.DispatchAsync(command, ct);

		return Results.Ok(new { projectId = result.ProjectId });
	}
}
