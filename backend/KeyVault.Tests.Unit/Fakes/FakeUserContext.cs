using KeyVault.Application.Actors;
using KeyVault.Domain.Identity;
using KeyVault.Domain.Users;

namespace KeyVault.Tests.Unit.Fakes;

public sealed class FakeUserContext : IUserContext
{
	public ActorType Type => ActorType.User;

	public ActorId Id { get; set; } = ActorId.User(Guid.NewGuid());
	public UserStatus Status { get; set; } = UserStatus.Active;
	public bool IsActive { get; set; } = true;
}
