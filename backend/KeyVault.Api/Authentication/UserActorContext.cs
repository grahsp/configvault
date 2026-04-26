using KeyVault.Application.Authentication;
using KeyVault.Domain;
using KeyVault.Domain.Users;

namespace KeyVault.Api.Authentication;

// TODO: should inherit IActorContext once implemented everywhere
// TODO: should not be registered in DI - Constructor should accept AuthenticatedUser
public class UserActorContext(IHttpContextAccessor accessor) : IUserContext
{
	public ActorType Type => ActorType.User;
		
	private AuthenticatedUser? User => accessor.HttpContext?.GetCurrentUser();
	public bool IsAuthenticated => User is not null;

	public ActorId Id => ActorId.User(UserId);
	
	[Obsolete("Use Id instead")]
	public Guid UserId => RequireUser().Id;
	public UserStatus Status => RequireUser().Status;
	public bool IsActive => Status == UserStatus.Active;

	private AuthenticatedUser RequireUser()
		=> User ?? throw new InvalidOperationException("No authenticated user available for the current request.");
}