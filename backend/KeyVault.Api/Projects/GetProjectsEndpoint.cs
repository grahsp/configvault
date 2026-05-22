using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Queries;

namespace KeyVault.Api.Projects;

internal static class GetProjectsEndpoint
{
	internal static async Task<IResult> Handle(IQueryDispatcher dispatcher, CancellationToken ct)
	{
		var query = new GetProjectsQuery();
		var projects = await dispatcher.DispatchAsync(query, ct);
		
		return Results.Ok(projects);
	}
}
