using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.CreateProject;

namespace KeyVault.Api.Projects.CreateProject;

internal static class CreateProject
{
	internal static async Task<IResult> Handle(ICommandDispatcher dispatcher, CreateProjectRequest request, CancellationToken ct)
	{
		var command = new CreateProjectCommand(request.Name);
		var id = await dispatcher.DispatchAsync(command, ct);
		
		return Results.CreatedAtRoute(
			nameof(GetProjectDetails.GetProjectDetails),
			new RouteValueDictionary { ["id"] = id },
			new { id });
	}
}