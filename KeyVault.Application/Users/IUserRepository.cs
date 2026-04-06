using KeyVault.Domain.Users;

namespace KeyVault.Application.Users;

public interface IUserRepository
{
	void Add(User user);
	void Remove(User user);
}