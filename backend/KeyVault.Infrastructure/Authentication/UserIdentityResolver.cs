using KeyVault.Application.Authentication;
using KeyVault.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Infrastructure.Authentication;

public sealed class UserIdentityResolver(AppDbContext context)
	: IUserIdentityResolver
{
	public Task<ResolvedUser?> GetUserAsync(ExternalIdentity identity, CancellationToken ct)
	{
		return context.Users
			.Where(u => u.ExternalLogins
				.Any(l => l.Issuer == identity.Issuer && l.Subject == identity.Subject))
			.Select(u => new ResolvedUser(u.Id))
			.SingleOrDefaultAsync(ct);
	}
}
