using KeyVault.Domain.Users;

namespace KeyVault.Api.Authentication;

public static class CurrentUserHttpContextExtensions
{
	private static readonly object CurrentUserKey = new object();

	public static void SetCurrentUser(this HttpContext context, User user)
	{
		context.Items[CurrentUserKey] = user;
	}

	public static User? GetCurrentUser(this HttpContext context)
	{
		return context.Items.TryGetValue(CurrentUserKey, out var user)
			? user as User
			: null;
	}

	public static User RequireCurrentUser(this HttpContext context)
	{
		return GetCurrentUser(context)
		       ?? throw new InvalidOperationException("Current user not resolved");
	}
}