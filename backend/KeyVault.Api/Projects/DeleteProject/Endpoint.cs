using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Commands;

namespace KeyVault.Api.Projects.DeleteProject;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(ICommandDispatcher dispatcher, Guid projectId, CancellationToken ct)
	{
		var command = new DeleteProjectCommand(projectId);
		await dispatcher.DispatchAsync(command, ct);
		
		return Results.NoContent();
	}
}
