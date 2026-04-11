using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Commands.SetRole;

namespace KeyVault.Api.Projects.SetRole;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(
		ICommandDispatcher dispatcher,
		Guid projectId,
		Guid userId,
		Request request,
		CancellationToken ct)
	{
		var command = new Command(projectId, userId, request.Role);
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}
}