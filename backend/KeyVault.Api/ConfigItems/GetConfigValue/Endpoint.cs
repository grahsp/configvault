using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Queries.GetConfigValue;

namespace KeyVault.Api.ConfigItems.GetConfigValue;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(
		IQueryDispatcher dispatcher,
		Guid projectId,
		Guid configItemId,
		string environment,
		CancellationToken ct)
	{
		var query = new Query(projectId, configItemId, environment);
		var value = await dispatcher.DispatchAsync(query, ct);
		
		return value is null
			? Results.NotFound()
			: Results.Ok(value);
	}
}