using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Commands;

namespace KeyVault.Api.Projects.RemoveEnvironment;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(ICommandDispatcher dispatcher, Guid projectId, Guid environmentId, CancellationToken ct)
	{
		var command = new RemoveEnvironmentCommand(projectId, environmentId);
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}
}
