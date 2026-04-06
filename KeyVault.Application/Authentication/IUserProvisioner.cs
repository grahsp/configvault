namespace KeyVault.Application.Authentication;

public interface IUserProvisioner
{
	Task<AuthenticatedUser> GetOrProvisionUserAsync(UserContext context, CancellationToken ct);
}