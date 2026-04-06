using KeyVault.Application.Users;
using KeyVault.Domain.Users;

namespace KeyVault.Infrastructure.Persistence.Repositories;

public class EfUserRepository(AppDbContext context) : IUserRepository
{
	public void Add(User user)
	{
		context.Users.Add(user);
	}

	public void Remove(User user)
	{
		context.Users.Remove(user);
	}
}