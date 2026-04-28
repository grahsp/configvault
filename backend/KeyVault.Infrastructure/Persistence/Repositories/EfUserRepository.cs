using KeyVault.Application.Users;
using KeyVault.Domain.Identity;
using KeyVault.Domain.Users;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Infrastructure.Persistence.Repositories;

public class EfUserRepository(AppDbContext context) : IUserRepository
{
	public Task<User?> GetByIdAsync(UserId id, CancellationToken ct) =>
		context.Users.SingleOrDefaultAsync(x => x.Id == id, ct);
	
	public void Add(User user)
	{
		context.Users.Add(user);
	}

	public void Remove(User user)
	{
		context.Users.Remove(user);
	}
}
