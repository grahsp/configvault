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

		var members = builder.MapGroup("/projects/{projectId}/members")
			.RequireAuthorization(Policies.ActiveUser)
			.WithTags("Members");

		members.MapGet("", GetMembers.Endpoint.Handle);
		members.MapPost("", AddMember.Endpoint.Handle);
		members.MapPut("/{userId}", SetRole.Endpoint.Handle);
		members.MapDelete("/{userId}", RemoveMember.Endpoint.Handle);

		var environments = builder.MapGroup("/projects/{projectId}/environments")
			.RequireAuthorization(Policies.ActiveUser)
			.WithTags("Environments");
		
		environments.MapGet("", GetEnvironments.Endpoint.Handle);
		environments.MapPost("", AddEnvironment.Endpoint.Handle);
	}
}