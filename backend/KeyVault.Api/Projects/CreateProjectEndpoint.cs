using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Commands;

namespace KeyVault.Api.Projects;

internal static class CreateProjectEndpoint
{
	internal static async Task<IResult> Handle(
		ICommandDispatcher dispatcher,
		CreateProjectRequest request,
		CancellationToken ct)
	{
		var command = new CreateProjectCommand(request.Name);
		var id = await dispatcher.DispatchAsync(command, ct);
		
		return Results.CreatedAtRoute(
			ProjectRouteNames.GetProject,
			new RouteValueDictionary { ["projectId"] = id },
			new CreateProjectResponse(id));
	}
}

public sealed record CreateProjectRequest(string Name);
public sealed record CreateProjectResponse(Guid Id);
