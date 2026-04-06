using KeyVault.Application.Authentication;
using KeyVault.Domain.Users;

namespace KeyVault.Api.Authentication;

public class CurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
	public User User => accessor.HttpContext?.GetCurrentUser()
	    ?? throw new InvalidOperationException("Current user not resolved");

	public Guid UserId => User.Id;
	public UserStatus Status => User.Status;
	public bool IsAuthenticated => accessor.HttpContext?.User.Identity?.IsAuthenticated == true;
}