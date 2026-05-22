using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Queries;

namespace KeyVault.Api.ConfigItems.GetConfigItems;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(IQueryDispatcher dispatcher, Guid projectId, string environment, CancellationToken ct)
	{
		var query = new GetConfigItemsQuery(projectId, environment);
		var items = await dispatcher.DispatchAsync(query, ct);

		return Results.Ok(items);
	}
}
