using KeyVault.Domain.Users;

namespace KeyVault.Application.Users;

public interface IUserRepository
{
	Task<User?> GetByExternalIdentityAsync(string issuer, string subject, CancellationToken ct);
	
	void Add(User user);
	void Remove(User user);
}