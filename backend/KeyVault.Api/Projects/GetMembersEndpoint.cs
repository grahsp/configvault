using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Queries;

namespace KeyVault.Api.Projects;

internal static class GetMembersEndpoint
{
	internal static async Task<IResult> Handle(IQueryDispatcher dispatcher, Guid projectId, CancellationToken ct)
	{
		var query = new GetMembersQuery(projectId);
		var items = await dispatcher.DispatchAsync(query, ct);

		return Results.Ok(items);
	}
}
