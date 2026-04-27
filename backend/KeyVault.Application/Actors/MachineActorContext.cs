using KeyVault.Domain.Identity;

namespace KeyVault.Application.Actors;

public sealed class MachineActorContext : IActorContext
{
	public ActorType Type => ActorType.Machine;
	
	public ActorId Id { get; }
	public IReadOnlyList<string> Scopes { get; }

	public MachineActorContext(string clientId, IEnumerable<string> scopes)
	{
		Id = ActorId.Machine(clientId);
		Scopes = scopes.ToList();
	}
}