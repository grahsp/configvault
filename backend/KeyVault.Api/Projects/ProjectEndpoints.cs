using KeyVault.Api.Authorization;
using KeyVault.Api.Projects.GetProjectList;

namespace KeyVault.Api.Projects;

public static class ProjectEndpoints
{
	public static void AddProjectEndpoints(this IEndpointRouteBuilder builder)
	{
		var group = builder.MapGroup("/projects")
			.RequireAuthorization(Policies.ActiveUser)
			.WithTags("Projects");

		group.MapPost("", CreateProject.CreateProject.Handle);
		group.MapGet("", GetProjects.Handle);
		group.MapGet("/{id}", GetProjectDetails.GetProjectDetails.Handle)
			.WithName(nameof(GetProjectDetails.GetProjectDetails));
	}
}