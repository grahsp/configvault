using KeyVault.Application.Authentication;
using KeyVault.Application.Exceptions;

namespace KeyVault.Api.Authentication;

public sealed class ActorContextFactory(IHttpContextAccessor http) : IActorContextFactory
{
	public IActorContext Create()
	{
		var context = http.HttpContext!;

		if (context.GetCurrentUser() is {} user)
			return new UserActorContext(user);

		throw new UnauthorizedException();
	}
}