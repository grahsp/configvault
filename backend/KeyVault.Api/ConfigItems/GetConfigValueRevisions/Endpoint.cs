using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Queries;

namespace KeyVault.Api.ConfigItems.GetConfigValueRevisions;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(
		IQueryDispatcher dispatcher,
		Guid projectId,
		Guid configItemId,
		string environment,
		CancellationToken ct)
	{
		var query = new GetConfigValueRevisionsQuery(projectId, configItemId, environment);
		var revisions = await dispatcher.DispatchAsync(query, ct);
		return Results.Ok(revisions);
	}
}
