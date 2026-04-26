using KeyVault.Domain.Actors;
using KeyVault.Domain.Users;

namespace KeyVault.Application.Users;

public interface IUserRepository
{
	Task<User?> GetByIdAsync(ActorId id, CancellationToken ct);
	void Add(User user);
	void Remove(User user);
}