using KeyVault.Api.Authorization;

namespace KeyVault.Api.Projects;

public static class ProjectEndpoints
{
	public static void AddProjectEndpoints(this IEndpointRouteBuilder builder)
	{
		var group = builder.MapGroup("/projects")
			.RequireAuthorization(Policies.ActiveUser);

		group.MapPost("", CreateProject.CreateProject.Handle);
		group.MapGet("", GetProjects.GetProjects.Handle);
	}
}