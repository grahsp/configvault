namespace KeyVault.Api.Projects;

public static class ProjectEndpoints
{
	public static void AddProjectEndpoints(this IEndpointRouteBuilder builder)
	{
		var projects = builder.MapGroup("/projects")
			.WithTags("Projects");

		projects.MapPost("", CreateProject.Endpoint.Handle);
		projects.MapDelete("/{projectId}", DeleteProject.Endpoint.Handle);
		
		projects.MapGet("", GetProjects.Endpoint.Handle);
		projects.MapGet("/{projectId}", GetProject.Endpoint.Handle)
			.WithName(nameof(GetProject));

		var members = builder.MapGroup("/projects/{projectId}/members")
			.RequireAuthorization()
			.WithTags("Members");

		members.MapGet("", GetMembers.Endpoint.Handle);
		members.MapPost("/{userId}", AddMember.Endpoint.Handle);
		members.MapPut("/{userId}", SetRole.Endpoint.Handle);
		members.MapDelete("/{userId}", RemoveMember.Endpoint.Handle);

		var environments = builder.MapGroup("/projects/{projectId}/environments")
			.WithTags("Environments");
		
		environments.MapGet("", GetEnvironments.Endpoint.Handle)
			.WithName(nameof(GetEnvironments));
		environments.MapPost("", AddEnvironment.Endpoint.Handle);
		environments.MapDelete("/{environmentId}", RemoveEnvironment.Endpoint.Handle);
	}
}
