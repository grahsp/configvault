using KeyVault.Domain.Actors;

namespace KeyVault.Domain.Users;

public sealed class ExternalLogin
{
	public string Issuer { get; private init; } = null!;
	public string Subject { get; private init; } = null!;

	public ActorId ActorId { get; private init; } = null!;

	private ExternalLogin() {}

	internal ExternalLogin(string issuer, string subject, ActorId actorId)
	{
		ArgumentException.ThrowIfNullOrWhiteSpace(issuer);
		ArgumentException.ThrowIfNullOrWhiteSpace(subject);
		
		Issuer = issuer;
		Subject = subject;
		ActorId = actorId;
	}
}