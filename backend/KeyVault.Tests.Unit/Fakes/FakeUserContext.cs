using KeyVault.Application.Actors;
using KeyVault.Application.Authentication;
using KeyVault.Domain.Identity;

namespace KeyVault.Tests.Unit.Fakes;

public sealed class FakeUserContext(UserId? userId = null, string issuer = "https://issuer.example", string subject = "subject")
	: UserActorContext(new ResolvedUser(userId ?? UserId.New()), ActorId.User(issuer, subject))
{
	public string Issuer { get; } = issuer;
	public string Subject { get; } = subject;
}
