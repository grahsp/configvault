using KeyVault.Application.Authentication;
using KeyVault.Domain.Users;

namespace KeyVault.Tests.Unit.Fakes;

public sealed class FakeUserContext : IUserContext
{
	public ActorType Type => ActorType.User;
	
	public Guid UserId { get; set; } = Guid.NewGuid();
	public UserStatus Status => UserStatus.Active;
	public bool IsActive => true;
	public bool IsAuthenticated => true;
}
