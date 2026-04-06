using KeyVault.Application.Authentication;
using KeyVault.Application.Users;
using KeyVault.Domain.Users;
using Microsoft.AspNetCore.Http;

namespace KeyVault.Infrastructure.Authentication;

public class CurrentUser(
	IHttpContextAccessor accessor,
	UserContextFactory factory,
	IUserProvisioner provisioner)
	: ICurrentUser
{
	public Guid UserId
	{
		get
		{
			EnsureUser();
			return _cachedUser!.Id;
		}
	}

	public bool IsAuthenticated => accessor.HttpContext?.User.Identity?.IsAuthenticated == true;

	private User? _cachedUser;

	private void EnsureUser()
	{
		_cachedUser ??= ResolveUser();
	}
	
	private User ResolveUser()
	{
		var principal = accessor.HttpContext?.User ?? throw new InvalidOperationException("HttpContext is null");
		
		if (principal.Identity?.IsAuthenticated != true)
			throw new InvalidOperationException("User is not authenticated");

		var context = factory.Create(principal);

		return provisioner
			.GetOrProvisionUserAsync(context, CancellationToken.None)
			.GetAwaiter()
			.GetResult();
	}
}