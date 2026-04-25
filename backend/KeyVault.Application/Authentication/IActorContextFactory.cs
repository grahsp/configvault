namespace KeyVault.Application.Authentication;

public interface IActorContextFactory
{
	IActorContext Create();
}