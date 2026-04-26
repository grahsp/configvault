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
		members.MapPost("/{actorId}", AddMember.Endpoint.Handle);
		members.MapPut("/{actorId}", SetRole.Endpoint.Handle);
		members.MapDelete("/{actorId}", RemoveMember.Endpoint.Handle);

		var environments = builder.MapGroup("/projects/{projectId}/environments")
			.RequireAuthorization(Policies.ActiveUser)
			.WithTags("Environments");
		
		environments.MapGet("", GetEnvironments.Endpoint.Handle)
			.WithName(nameof(GetEnvironments));
		environments.MapPost("", AddEnvironment.Endpoint.Handle);
		environments.MapDelete("/{environmentId}", RemoveEnvironment.Endpoint.Handle);
	}
}