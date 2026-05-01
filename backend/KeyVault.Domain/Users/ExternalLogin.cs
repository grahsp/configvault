using KeyVault.Domain.Identity;

namespace KeyVault.Domain.Users;

public sealed class ExternalLogin
{
	public string Issuer { get; private init; } = null!;
	public string Subject { get; private init; } = null!;

	public UserId UserId { get; private init; }

	private ExternalLogin() {}

	internal ExternalLogin(string issuer, string subject, UserId userId)
	{
		ArgumentException.ThrowIfNullOrWhiteSpace(issuer);
		ArgumentException.ThrowIfNullOrWhiteSpace(subject);
		
		Issuer = issuer;
		Subject = subject;
		UserId = userId;
	}
}
