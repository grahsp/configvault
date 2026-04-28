using KeyVault.Domain.Projects;

namespace KeyVault.Domain.Identity;

public enum AccessScope{
	Global,
	Project,
}

public sealed class Actor(ActorId id, AccessScope scope, IEnumerable<ProjectCapability> capabilities)
{
	public ActorId Id { get; } = id;
	public AccessScope Scope { get; } = scope;
	private readonly HashSet<ProjectCapability> _capabilities = capabilities.ToHashSet();

	public bool Has(ProjectCapability capability)
		=> _capabilities.Contains(capability);
}