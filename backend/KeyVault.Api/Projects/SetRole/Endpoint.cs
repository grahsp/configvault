using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Commands.SetRole;
using KeyVault.Domain.Identity;

namespace KeyVault.Api.Projects.SetRole;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(
		ICommandDispatcher dispatcher,
		Guid projectId,
		ActorId actorId,
		Request request,
		CancellationToken ct)
	{
		var command = new Command(projectId, actorId, request.Role);
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}
}