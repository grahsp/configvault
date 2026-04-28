namespace KeyVault.Application.Authentication;

public sealed record ExternalIdentity(
	string Issuer,
	string Subject,
	string? Nickname,
	string? Email);
