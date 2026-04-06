namespace KeyVault.Application.Authentication;

public interface IUserIdentityResolver
{
	Task<AuthenticatedUser?> GetUserAsync(string issuer, string subject, CancellationToken ct);
}