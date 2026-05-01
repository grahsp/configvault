using KeyVault.Application.Exceptions;
using KeyVault.Domain.Identity;

namespace KeyVault.Application.Actors;

public static class ActorContextExtensions
{
	public static bool TryGetUserId(this IActorContext actor, out UserId userId)
	{
		userId = default;
		
		if (actor is UserActorContext user)
		{
			userId = user.UserId;
			return true;
		}
		
		return false;
	}

	public static UserId RequireUserId(this IActorContext actor)
	{
		return actor is UserActorContext user
			? user.UserId
			: throw new ForbiddenException();
	}
}