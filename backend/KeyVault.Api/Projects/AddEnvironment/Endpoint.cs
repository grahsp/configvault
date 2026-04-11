using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Commands.AddEnvironment;

namespace KeyVault.Api.Projects.AddEnvironment;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(ICommandDispatcher dispatcher, Guid projectId, Request request, CancellationToken ct)
	{
		var command = new Command(projectId, request.EnvironmentName);
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}
}