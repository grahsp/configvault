namespace KeyVault.Application.Authentication;

public interface IUserProvisioner
{
	Task<AuthenticatedUser> GetOrProvisionUserAsync(ExternalIdentity identity, CancellationToken ct);
}