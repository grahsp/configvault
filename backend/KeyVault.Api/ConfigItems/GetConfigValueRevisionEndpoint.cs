using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Queries;

namespace KeyVault.Api.ConfigItems;

internal static class GetConfigValueRevisionEndpoint
{
	internal static async Task<IResult> Handle(
		IQueryDispatcher dispatcher,
		Guid projectId,
		Guid configItemId,
		uint revision,
		string environment,
		CancellationToken ct)
	{
		var query = new GetConfigValueRevisionQuery(projectId, configItemId, environment, revision);
		var value = await dispatcher.DispatchAsync(query, ct);

		return value is null
			? Results.NotFound()
			: Results.Ok(value);
	}
}
