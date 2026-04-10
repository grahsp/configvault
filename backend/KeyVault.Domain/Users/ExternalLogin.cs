namespace KeyVault.Domain.Users;

public sealed class ExternalLogin
{
	public string Issuer { get; private init; } = null!;
	public string Subject { get; private init; } = null!;

	public Guid UserId { get; private init; }

	private ExternalLogin() {}

	internal ExternalLogin(string issuer, string subject, Guid userId)
	{
		ArgumentException.ThrowIfNullOrWhiteSpace(issuer);
		ArgumentException.ThrowIfNullOrWhiteSpace(subject);
		
		Issuer = issuer;
		Subject = subject;
		UserId = userId;
	}
}