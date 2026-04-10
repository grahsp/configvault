using KeyVault.Api.Authorization;

namespace KeyVault.Api.Projects;

public static class ProjectEndpoints
{
	public static void AddProjectEndpoints(this IEndpointRouteBuilder builder)
	{
		var group = builder.MapGroup("/projects")
			.RequireAuthorization(Policies.ActiveUser)
			.WithTags("Projects");

		group.MapPost("", CreateProject.Endpoint.Handle);
		group.MapDelete("/{id}", DeleteProject.Endpoint.Handle);
		
		group.MapGet("", GetProjects.Endpoint.Handle);
		group.MapGet("/{id}", GetProject.Endpoint.Handle)
			.WithName(nameof(GetProject));
	}
}