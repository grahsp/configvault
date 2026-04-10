using KeyVault.Api.Authorization;
using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.CreateProject;

namespace KeyVault.Api.Projects;

public static class ProjectEndpoints
{
	public static void AddProjectEndpoints(this IEndpointRouteBuilder builder)
	{
		var group = builder.MapGroup("/projects");
		
		group.MapPost("", CreateProject.Handle)
			.RequireAuthorization(Policies.ActiveUser);
	}
}

internal static class CreateProject
{
	internal static async Task<IResult> Handle(ICommandDispatcher dispatcher, CreateProjectRequest request, CancellationToken ct)
	{
		var command = new CreateProjectCommand(request.Name);
		var id = await dispatcher.DispatchAsync(command, ct);
		
		return Results.Ok(id);
	}
}

public sealed record CreateProjectRequest(string Name);