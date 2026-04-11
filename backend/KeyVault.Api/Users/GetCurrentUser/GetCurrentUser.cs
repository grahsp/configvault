using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Users.GetCurrentUser;

namespace KeyVault.Api.Users.GetCurrentUser;

internal static class GetCurrentUser
{
	internal static async Task<IResult> Handle(IQueryDispatcher dispatcher, CancellationToken ct)
	{
		var query = new GetCurrentUserQuery();
		var user = await dispatcher.DispatchAsync(query, ct);
		
		return Results.Ok(user);
	}
}