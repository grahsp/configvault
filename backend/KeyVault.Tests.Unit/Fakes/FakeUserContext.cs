using KeyVault.Application.Authentication;
using KeyVault.Domain.Actors;
using KeyVault.Domain.Users;

namespace KeyVault.Tests.Unit.Fakes;

public sealed class FakeUserContext : IUserContext
{
	private ActorId? _actorId;

	public ActorType Type => ActorType.User;
	
	public Guid UserId { get; set; } = Guid.NewGuid();
	public ActorId ActorId
	{
		get => _actorId ?? ActorId.User(UserId);
		set => _actorId = value;
	}

	public UserStatus Status { get; set; } = UserStatus.Active;
	public bool IsActive { get; set; } = true;
	public bool IsAuthenticated => true;
	
	public ActorId Id => ActorId;
}
