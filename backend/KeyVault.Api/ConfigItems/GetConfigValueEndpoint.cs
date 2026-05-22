using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Queries;

namespace KeyVault.Api.ConfigItems;

internal static class GetConfigValueEndpoint
{
	internal static async Task<IResult> Handle(
		IQueryDispatcher dispatcher,
		Guid projectId,
		Guid configItemId,
		string environment,
		CancellationToken ct)
	{
		var query = new GetConfigValueQuery(projectId, configItemId, environment);
		var value = await dispatcher.DispatchAsync(query, ct);
		
		return value is null
			? Results.NotFound()
			: Results.Ok(value);
	}
}
