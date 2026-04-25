using KeyVault.Application.Authentication;
using KeyVault.Application.Exceptions;

namespace KeyVault.Api.Authentication;

public sealed class ActorContextFactory(IHttpContextAccessor http) : IActorContextFactory
{
	public IActorContext Create()
	{
		var context = http.HttpContext!;

		if (context.GetCurrentUser() is {} user)
			// TODO: Should pass user
			return new UserActorContext(http);

		throw new UnauthorizedException();
	}
}