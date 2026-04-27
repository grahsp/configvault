using System.Security.Claims;
using KeyVault.Application.Actors;
using KeyVault.Application.Exceptions;

namespace KeyVault.Api.Authentication;

public sealed class ActorContextFactory(IHttpContextAccessor http) : IActorContextFactory
{
	public IActorContext Create()
	{
		var context = http.HttpContext!;

		if (context.User.IsMachine())
			return new MachineActorContext(
				context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new Exception("Missing identifier claim"),
				context.User.FindAll("scope").Select(c => c.Value));
		
		if (context.GetCurrentUser() is {} user)
			return new UserActorContext(user);

		throw new UnauthorizedException();
	}
}