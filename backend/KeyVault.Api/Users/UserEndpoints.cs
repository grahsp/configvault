using KeyVault.Api.Authorization;

namespace KeyVault.Api.Users;

public static class UserEndpoints
{
	public static void AddUserEndpoints(this IEndpointRouteBuilder builder)
	{
		builder.MapGet("/me", GetCurrentUserEndpoint.Handle)
			.RequireAuthorization(AuthorizationPolicies.UserOnly);
	}
}
