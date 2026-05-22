using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Commands;

namespace KeyVault.Api.Projects.AddEnvironment;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(ICommandDispatcher dispatcher, Guid projectId, Request request, CancellationToken ct)
	{
		var command = new AddEnvironmentCommand(projectId, request.EnvironmentName);
		var environment = await dispatcher.DispatchAsync(command, ct);

		return Results.CreatedAtRoute(nameof(GetEnvironments), environment);
	}
}
