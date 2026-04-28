using KeyVault.Application.Authentication;
using KeyVault.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Infrastructure.Authentication;

public sealed class UserIdentityResolver(AppDbContext context)
	: IUserIdentityResolver
{
	public Task<AuthenticatedUser?> GetUserAsync(string issuer, string subject, CancellationToken ct)
	{
		return context.Users
			.Where(u => u.ExternalLogins
				.Any(l => l.Issuer == issuer && l.Subject == subject))
			.Select(u => new AuthenticatedUser(u.Id, u.Status, issuer, subject))
			.SingleOrDefaultAsync(ct);
	}
}
