using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Domain.Identity;

namespace KeyVault.Application.Actors;

public sealed class Actor(ActorId id, IEnumerable<ProjectCapability> capabilities)
{
	public ActorId Id { get; } = id;
	private readonly HashSet<ProjectCapability> _capabilities = capabilities.ToHashSet();

	public bool Has(ProjectCapability capability)
		=> _capabilities.Contains(capability);
}
