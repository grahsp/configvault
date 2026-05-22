using KeyVault.Api.Authorization;

namespace KeyVault.Api.Projects;

public static class ProjectEndpoints
{
	public static void AddProjectEndpoints(this IEndpointRouteBuilder builder)
	{
		var projects = builder.MapGroup("/projects")
			.RequireAuthorization(AuthorizationPolicies.UserOnly)
			.WithTags("Projects");

		projects.MapPost("", CreateProjectEndpoint.Handle);
		projects.MapDelete("/{projectId}", DeleteProjectEndpoint.Handle);
		
		projects.MapGet("", GetProjectsEndpoint.Handle);
		projects.MapGet("/{projectId}", GetProjectEndpoint.Handle)
			.WithName("GetProject");

		var members = builder.MapGroup("/projects/{projectId}/members")
			.RequireAuthorization()
			.WithTags("Members");

		members.MapGet("", GetMembersEndpoint.Handle);
		members.MapPost("/{userId}", AddMemberEndpoint.Handle);
		members.MapPut("/{userId}", SetRoleEndpoint.Handle);
		members.MapDelete("/{userId}", RemoveMemberEndpoint.Handle);

		var environments = builder.MapGroup("/projects/{projectId}/environments")
			.WithTags("Environments");
		
		environments.MapGet("", GetEnvironmentsEndpoint.Handle)
			.WithName("GetEnvironments");
		environments.MapPost("", AddEnvironmentEndpoint.Handle);
		environments.MapDelete("/{environmentId}", RemoveEnvironmentEndpoint.Handle);
	}
}
