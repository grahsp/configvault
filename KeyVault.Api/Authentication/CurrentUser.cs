using KeyVault.Application.Authentication;
using KeyVault.Domain.Users;

namespace KeyVault.Api.Authentication;

public class CurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
	private AuthenticatedUser? User => accessor.HttpContext?.GetCurrentUser();
	public bool IsAuthenticated => User is not null;

	public Guid UserId => RequireUser().Id;
	public UserStatus Status => RequireUser().Status;
	public bool IsActive => Status == UserStatus.Active;

	private AuthenticatedUser RequireUser()
		=> User ?? throw new InvalidOperationException("No authenticated user available for the current request.");
}