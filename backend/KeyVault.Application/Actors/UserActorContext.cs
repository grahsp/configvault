using KeyVault.Application.Authentication;
using KeyVault.Domain.Identity;
using KeyVault.Domain.Users;

namespace KeyVault.Application.Actors;

public class UserActorContext(AuthenticatedUser user) : IActorContext
{
	public ActorType Type => ActorType.User;
	
	public ActorId Id => ActorId.User(user.Issuer, user.Subject);
	public UserId? UserId => user.Id;
	public UserStatus Status => user.Status;
	public bool IsActive => Status == UserStatus.Active;
}
