using KeyVault.Domain.Identity;

namespace KeyVault.Application.Actors;

public sealed class MachineActorContext : IActorContext
{
	public ActorId Id { get; }
	public UserId? UserId => null;
	public IReadOnlyList<string> Scopes { get; }

	public MachineActorContext(string issuer, string clientId, IEnumerable<string> scopes)
	{
		Id = ActorId.Machine(issuer, clientId);
		Scopes = scopes.ToList();
	}
}
