using KeyVault.Domain.ConfigItems;
using KeyVault.Domain.Projects;
using ProjectEnvironment = KeyVault.Domain.Projects.Environment;

namespace KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations;

public sealed class ExecutionContext(
	Project project,
	Guid actorId,
	ProjectEnvironment? environment,
	IDictionary<Guid, ConfigItem> loadedItems,
	ISet<Guid> deletedItemIds,
	IList<ConfigItem> createdItems,
	IList<ConfigItem> removedItems)
{
	public Project Project { get; } = project;
	public Guid ActorId { get; } = actorId;
	public ProjectEnvironment? Environment { get; } = environment;
	public IDictionary<Guid, ConfigItem> LoadedItems { get; } = loadedItems;
	public ISet<Guid> DeletedItemIds { get; } = deletedItemIds;
	public IList<ConfigItem> CreatedItems { get; } = createdItems;
	public IList<ConfigItem> RemovedItems { get; } = removedItems;
}
