using KeyVault.Domain.Identity;

namespace KeyVault.Application.Actors;

public interface IActorContext
{
	public ActorId Id { get; }
}
