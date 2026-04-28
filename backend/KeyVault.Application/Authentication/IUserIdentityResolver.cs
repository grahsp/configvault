namespace KeyVault.Application.Authentication;

public interface IUserIdentityResolver
{
	Task<ResolvedUser?> GetUserAsync(ExternalIdentity identity, CancellationToken ct);
}
