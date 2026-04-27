namespace KeyVault.Application.Actors;

public interface IActorContextFactory
{
	IActorContext Create();
}