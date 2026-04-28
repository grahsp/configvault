using KeyVault.Application.Authentication;

namespace KeyVault.Api.Authentication;

public static class CurrentUserHttpContextExtensions
{
	private static readonly object CurrentUserKey = new object();

	public static void SetCurrentUser(this HttpContext context, ResolvedUser user)
	{
		context.Items[CurrentUserKey] = user;
	}

	public static ResolvedUser? GetCurrentUser(this HttpContext context)
	{
		return context.Items.TryGetValue(CurrentUserKey, out var user)
			? user as ResolvedUser
			: null;
	}

	public static ResolvedUser RequireCurrentUser(this HttpContext context)
	{
		return GetCurrentUser(context)
		       ?? throw new InvalidOperationException("Current user not resolved");
	}
}