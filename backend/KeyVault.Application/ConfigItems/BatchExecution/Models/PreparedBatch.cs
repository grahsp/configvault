using KeyVault.Application.ConfigItems.BatchExecution.Operations;
using KeyVault.Domain.ConfigItems;
using KeyVault.Domain.Projects;
using Environment = KeyVault.Domain.Projects.Environment;

namespace KeyVault.Application.ConfigItems.BatchExecution.Models;

public sealed class PreparedBatch
{
	public Project Project { get; }
	public Environment? Environment { get; }

	public Dictionary<Guid, ConfigItem> Items { get; }
	public HashSet<Guid> DeletedItemIds { get; } = [];
	public List<ConfigItem> CreatedItems { get; } = [];
	public List<ConfigItem> RemovedItems { get; } = [];

	public IReadOnlyList<Operation> Operations { get; }

	public PreparedBatch(
		Project project,
		Environment? environment,
		Dictionary<Guid, ConfigItem> items,
		IReadOnlyList<Operation> operations)
	{
		Project = project;
		Environment = environment;

		Items = items;
		Operations = operations;
	}
}
