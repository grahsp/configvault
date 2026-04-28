namespace KeyVault.Application.Authentication;

public interface IUserProvisioner
{
	Task<ResolvedUser> GetOrProvisionUserAsync(ExternalIdentity identity, CancellationToken ct);
}