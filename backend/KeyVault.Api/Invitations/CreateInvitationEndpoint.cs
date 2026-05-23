using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Invitations.Commands;

namespace KeyVault.Api.Invitations;

internal static class CreateInvitationEndpoint
{
	internal static async Task<IResult> Handle(ICommandDispatcher dispatcher, Guid projectId, CancellationToken ct)
	{
		var command = new CreateInvitationCommand(projectId);
		var token = await dispatcher.DispatchAsync(command, ct);

		return Results.Ok(new CreateInvitationResponse(token));
	}
}

public sealed record CreateInvitationResponse(string Token);
