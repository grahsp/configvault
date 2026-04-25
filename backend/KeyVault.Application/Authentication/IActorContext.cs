namespace KeyVault.Application.Authentication;

public interface IActorContext
{
	ActorType Type { get; }
}