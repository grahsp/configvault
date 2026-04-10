namespace KeyVault.Api.Users;

public static class UserEndpoint
{
	public static void AddUserEndpoints(this IEndpointRouteBuilder builder)
	{
		builder.MapGet("/me", GetCurrentUser.GetCurrentUser.Handle);
		
		var group = builder.MapGroup("/users");
		group.MapPost("/activate", ActivateUser.ActivateUser.Handle);
	}
}