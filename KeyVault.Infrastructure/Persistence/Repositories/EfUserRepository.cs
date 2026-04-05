using KeyVault.Application.Users;
using KeyVault.Domain.Users;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Infrastructure.Persistence.Repositories;

public class EfUserRepository(AppDbContext context) : IUserRepository
{
	public Task<User?> GetByExternalIdentityAsync(string issuer, string subject, CancellationToken ct)
	{
		return context.Users
			.Where(user => user.ExternalLogins
				.Any(login => login.Issuer == issuer && login.Subject == subject))
			.SingleOrDefaultAsync(ct);
	}

	public void Add(User user)
	{
		context.Users.Add(user);
	}

	public void Remove(User user)
	{
		context.Users.Remove(user);
	}
}