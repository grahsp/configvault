using System.Security.Claims;
using KeyVault.Application.Actors;
using KeyVault.Application.Exceptions;
using KeyVault.Domain.Identity;

namespace KeyVault.Api.Authentication;

public sealed class ActorContextFactory(IHttpContextAccessor http) : IActorContextFactory
{
	public IActorContext Create()
	{
		var context = http.HttpContext!;

		if (context.User.IsMachine())
			return new MachineActorContext(
				context.User.FindFirstValue("iss") ?? throw new Exception("Missing issuer claim"),
				context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new Exception("Missing identifier claim"),
				GetScopes(context.User));
		
		if (context.GetCurrentUser() is {} user)
		{
			var identity = context.User.GetExternalIdentity();
			return new UserActorContext(user, ActorId.User(identity.Issuer, identity.Subject));
		}

		throw new UnauthorizedException();
	}

	private static IEnumerable<string> GetScopes(ClaimsPrincipal principal)
	{
		return principal.FindAll("scope")
			.SelectMany(claim => claim.Value.Split(' ', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries));
	}
}
