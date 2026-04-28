using KeyVault.Domain.Identity;
using KeyVault.Domain.Users;

namespace KeyVault.Application.Users;

public interface IUserRepository
{
	Task<User?> GetByIdAsync(UserId id, CancellationToken ct);
	void Add(User user);
	void Remove(User user);
}
