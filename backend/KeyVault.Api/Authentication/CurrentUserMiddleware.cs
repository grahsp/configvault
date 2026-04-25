using KeyVault.Application.Authentication;

namespace KeyVault.Api.Authentication;

public class CurrentUserMiddleware(RequestDelegate next)
{
	public async Task InvokeAsync(HttpContext context, IUserProvisioner provisioner, IUserContextFactory factory)
	{
		var principal = context.User;

		if (principal.Identity?.IsAuthenticated == true && !principal.IsMachine())
		{
			var identity = factory.Create(principal);

			var user = await provisioner.GetOrProvisionUserAsync(identity, context.RequestAborted);
			context.SetCurrentUser(user);
		}

		await next(context);
	}
}