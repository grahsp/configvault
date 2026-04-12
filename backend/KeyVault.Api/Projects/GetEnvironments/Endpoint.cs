using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Queries.GetEnvironments;

namespace KeyVault.Api.Projects.GetEnvironments;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(IQueryDispatcher dispatcher, Guid projectId, CancellationToken ct)
	{
		var query = new Query(projectId);
		var items = await dispatcher.DispatchAsync(query, ct);

		return Results.Ok(items);
	}
}
