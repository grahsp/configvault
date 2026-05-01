using KeyVault.Application.Actors;
using KeyVault.Domain.Identity;

namespace KeyVault.Tests.Unit.Fakes;

public sealed class FakeUserContext : IActorContext
{
	public string Issuer { get; set; } = "https://issuer.example";
	public string Subject { get; set; } = "subject";
	public ActorId Id => ActorId.User(Issuer, Subject);
	public UserId UserId { get; set; } = UserId.New();
	public bool IsActive { get; set; } = true;
}
