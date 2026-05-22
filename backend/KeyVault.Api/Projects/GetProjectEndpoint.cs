using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Queries;

namespace KeyVault.Api.Projects;

internal static class GetProjectEndpoint
{
	internal static async Task<IResult> Handle(
		IQueryDispatcher dispatcher,
		Guid projectId,
		CancellationToken ct)
	{
		var query = new GetProjectQuery(projectId);
		var project = await dispatcher.DispatchAsync(query, ct);

		if (project is null)
			return Results.NotFound();

		return Results.Ok(project);
	}
}
