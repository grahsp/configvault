using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Invitations.Commands.CreateInvitation;

namespace KeyVault.Api.Invitations.CreateInvitation;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(ICommandDispatcher dispatcher, Guid projectId, CancellationToken ct)
	{
		var command = new Command(projectId);
		var token = await dispatcher.DispatchAsync(command, ct);

		return Results.Ok(new { token });
	}
}
