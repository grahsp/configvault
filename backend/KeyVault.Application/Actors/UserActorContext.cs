using KeyVault.Application.Authentication;
using KeyVault.Domain.Identity;

namespace KeyVault.Application.Actors;

public class UserActorContext(ResolvedUser user, ActorId actorId) : IActorContext
{
	public ActorType Type => ActorType.User;
	
	public ActorId Id => actorId;
	public UserId UserId => user.Id;
	public bool IsActive => true;
}
