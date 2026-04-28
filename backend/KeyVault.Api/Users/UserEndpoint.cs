using KeyVault.Api.Authorization;

namespace KeyVault.Api.Users;

public static class UserEndpoint
{
	public static void AddUserEndpoints(this IEndpointRouteBuilder builder)
	{
		builder.MapGet("/me", GetCurrentUser.GetCurrentUser.Handle)
			.RequireAuthorization(AuthorizationPolicies.UserOnly);
	}
}
