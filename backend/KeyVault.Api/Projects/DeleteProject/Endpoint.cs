using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.DeleteProject;

namespace KeyVault.Api.Projects.DeleteProject;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(ICommandDispatcher dispatcher, Guid id, CancellationToken ct)
	{
		var command = new DeleteProjectCommand(id);
		await dispatcher.DispatchAsync(command, ct);
		
		return Results.NoContent();
	}
}
