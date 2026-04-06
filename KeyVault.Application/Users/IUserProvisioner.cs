using KeyVault.Application.Authentication;
using KeyVault.Domain.Users;

namespace KeyVault.Application.Users;

public interface IUserProvisioner
{
	Task<User> GetOrProvisionUserAsync(UserContext context, CancellationToken ct);
}