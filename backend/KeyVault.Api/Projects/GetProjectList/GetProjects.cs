using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.GetProjectList;

namespace KeyVault.Api.Projects.GetProjectList;

internal static class GetProjects
{
	internal static async Task<IResult> Handle(IQueryDispatcher dispatcher, CancellationToken ct)
	{
		var query = new GetProjectListQuery();
		var result = await dispatcher.DispatchAsync(query, ct);
		
		return Results.Ok(result);
	}
}