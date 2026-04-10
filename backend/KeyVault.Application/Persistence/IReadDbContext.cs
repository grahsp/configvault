using KeyVault.Domain.Users;

namespace KeyVault.Application.Persistence;

public interface IReadDbContext
{
	IQueryable<User> Users { get; }
}