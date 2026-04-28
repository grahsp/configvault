using KeyVault.Application.Actors;
using KeyVault.Domain.Identity;
using KeyVault.Domain.Users;

namespace KeyVault.Tests.Unit.Fakes;

public sealed class FakeUserContext : IActorContext
{
	public ActorType Type => ActorType.User;

	public string Issuer { get; set; } = "https://issuer.example";
	public string Subject { get; set; } = "subject";
	public ActorId Id => ActorId.User(Issuer, Subject);
	public UserId UserId { get; set; } = UserId.New();
	public UserStatus Status { get; set; } = UserStatus.Active;
	public bool IsActive { get; set; } = true;
}
