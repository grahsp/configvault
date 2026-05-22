using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Users.Queries;

namespace KeyVault.Api.Users;

internal static class GetCurrentUserEndpoint
{
	internal static async Task<IResult> Handle(IQueryDispatcher dispatcher, CancellationToken ct)
	{
		var query = new GetCurrentUserQuery();
		var user = await dispatcher.DispatchAsync(query, ct);
		
		return Results.Ok(user);
	}
}
