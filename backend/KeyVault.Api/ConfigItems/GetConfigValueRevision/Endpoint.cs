using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Queries.GetConfigValueRevision;

namespace KeyVault.Api.ConfigItems.GetConfigValueRevision;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(
		IQueryDispatcher dispatcher,
		Guid projectId,
		Guid configItemId,
		uint revision,
		string environment,
		CancellationToken ct)
	{
		var query = new Query(projectId, configItemId, environment, revision);
		var value = await dispatcher.DispatchAsync(query, ct);

		return value is null
			? Results.NotFound()
			: Results.Ok(value);
	}
}
