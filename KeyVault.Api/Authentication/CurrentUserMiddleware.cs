using KeyVault.Application.Authentication;
using KeyVault.Application.Users;

namespace KeyVault.Api.Authentication;

public class CurrentUserMiddleware(RequestDelegate next)
{
	public async Task InvokeAsync(HttpContext context, IUserProvisioner provisioner, UserContextFactory factory)
	{
		var principal = context.User;

		if (principal.Identity?.IsAuthenticated == true)
		{
			var userContext = factory.Create(principal);

			var user = await provisioner.GetOrProvisionUserAsync(userContext, context.RequestAborted);
			context.SetCurrentUser(user);
		}

		await next(context);
	}
}