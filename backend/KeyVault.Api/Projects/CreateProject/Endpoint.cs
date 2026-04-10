using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Commands.CreateProject;

namespace KeyVault.Api.Projects.CreateProject;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(ICommandDispatcher dispatcher, Request request, CancellationToken ct)
	{
		var command = new Command(request.Name);
		var id = await dispatcher.DispatchAsync(command, ct);
		
		return Results.CreatedAtRoute(
			nameof(GetProject.Endpoint),
			new RouteValueDictionary { ["id"] = id },
			new { id });
	}
}