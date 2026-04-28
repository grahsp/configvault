using KeyVault.Domain.Identity;

namespace KeyVault.Application.Actors;

public interface IActorContext
{
	public ActorType Type { get; }
	public ActorId Id { get; }
	public UserId? UserId { get; }
}
