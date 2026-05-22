using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Queries;

namespace KeyVault.Api.Projects;

internal static class GetEnvironmentsEndpoint
{
	internal static async Task<IResult> Handle(IQueryDispatcher dispatcher, Guid projectId, CancellationToken ct)
	{
		var query = new GetEnvironmentsQuery(projectId);
		var items = await dispatcher.DispatchAsync(query, ct);

		return Results.Ok(items);
	}
}
