using KeyVault.Domain.Actors;

namespace KeyVault.Application.Authentication;

public interface IActorContext
{
	public ActorId Id { get; }
}