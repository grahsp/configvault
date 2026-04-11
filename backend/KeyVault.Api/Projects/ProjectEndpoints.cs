using KeyVault.Api.Authorization;

namespace KeyVault.Api.Projects;

public static class ProjectEndpoints
{
	public static void AddProjectEndpoints(this IEndpointRouteBuilder builder)
	{
		var projects = builder.MapGroup("/projects")
			.RequireAuthorization(Policies.ActiveUser)
			.WithTags("Projects");

		projects.MapPost("", CreateProject.Endpoint.Handle);
		projects.MapDelete("/{id}", DeleteProject.Endpoint.Handle);
		
		projects.MapGet("", GetProjects.Endpoint.Handle);
		projects.MapGet("/{id}", GetProject.Endpoint.Handle)
			.WithName(nameof(GetProject));

		var members = builder.MapGroup("/projects/{id}/members")
			.RequireAuthorization(Policies.ActiveUser)
			.WithTags("Members");

		members.MapPost("", AddMember.Endpoint.Handle);
	}
}