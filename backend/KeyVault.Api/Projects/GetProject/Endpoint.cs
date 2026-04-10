using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Queries.GetProject;

namespace KeyVault.Api.Projects.GetProject;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(
		IQueryDispatcher dispatcher,
		Guid id,
		CancellationToken ct)
	{
		var query = new Query(id);
		var result = await dispatcher.DispatchAsync(query, ct);

		return Results.Ok(result);
	}
}