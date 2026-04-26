using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Queries.GetProject;

namespace KeyVault.Api.Projects.GetProject;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(
		IQueryDispatcher dispatcher,
		Guid projectId,
		CancellationToken ct)
	{
		var query = new Query(projectId);
		var project = await dispatcher.DispatchAsync(query, ct);

		if (project is null)
			return Results.NotFound();

		return Results.Ok(project);
	}
}