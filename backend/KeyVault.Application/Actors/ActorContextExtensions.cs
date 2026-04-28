using KeyVault.Application.Exceptions;
using KeyVault.Domain.Identity;

namespace KeyVault.Application.Actors;

public static class ActorContextExtensions
{
	public static bool TryGetUserId(this IActorContext actor, out UserId? userId)
	{
		userId = actor.UserId;
		return userId is not null;
	}

	public static UserId RequireUserId(this IActorContext actor)
	{
		return actor.TryGetUserId(out var userId)
			? userId!
			: throw new ForbiddenException();
	}
}
