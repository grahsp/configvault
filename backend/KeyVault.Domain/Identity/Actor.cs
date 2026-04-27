using KeyVault.Domain.Projects;

namespace KeyVault.Domain.Identity;

public sealed class Actor(ActorId id, IEnumerable<ProjectCapability> capabilities)
{
	public ActorId Id { get; } = id;
	private readonly HashSet<ProjectCapability> _capabilities = capabilities.ToHashSet();

	public bool Has(ProjectCapability capability)
		=> _capabilities.Contains(capability);
}