using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Commands;
using KeyVault.Domain.Identity;

namespace KeyVault.Api.Projects.SetRole;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(
		ICommandDispatcher dispatcher,
		Guid projectId,
		UserId userId,
		Request request,
		CancellationToken ct)
	{
		var command = new SetRoleCommand(projectId, userId, request.Role);
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}
}
