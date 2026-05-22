using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Invitations.Commands;

namespace KeyVault.Api.Invitations.CreateInvitation;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(ICommandDispatcher dispatcher, Guid projectId, CancellationToken ct)
	{
		var command = new CreateInvitationCommand(projectId);
		var token = await dispatcher.DispatchAsync(command, ct);

		return Results.Ok(new { token });
	}
}
