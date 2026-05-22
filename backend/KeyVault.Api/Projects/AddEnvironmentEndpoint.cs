using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Commands;

namespace KeyVault.Api.Projects;

internal static class AddEnvironmentEndpoint
{
	internal static async Task<IResult> Handle(
		ICommandDispatcher dispatcher,
		Guid projectId,
		AddEnvironmentRequest request,
		CancellationToken ct)
	{
		var command = new AddEnvironmentCommand(projectId, request.EnvironmentName);
		var environment = await dispatcher.DispatchAsync(command, ct);

		return Results.CreatedAtRoute("GetEnvironments", environment);
	}
}

internal sealed record AddEnvironmentRequest(string EnvironmentName);
