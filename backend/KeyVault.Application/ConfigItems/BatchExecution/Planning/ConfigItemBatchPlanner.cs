using KeyVault.Application.Actors;
using KeyVault.Application.ConfigItems.BatchExecution.Models;
using KeyVault.Application.ConfigItems.Exceptions;
using KeyVault.Domain.ConfigItems;
using KeyVault.Domain.Projects;
using Environment = KeyVault.Domain.Projects.Environment;

namespace KeyVault.Application.ConfigItems.BatchExecution.Planning;

public sealed class ConfigItemBatchPlanner(
	IConfigItemRepository repository)
	: IConfigItemBatchPlanner
{
	public async Task<PreparedBatch> PrepareAsync(
		IActorContext actor,
		Project project,
		OperationBatch batch,
		CancellationToken ct)
	{
		var environment = ResolveEnvironmentIfRequired(project, batch);

		var configItemIds = ExtractReferencedIds(batch.Operations);
		var items = await LoadItems(project.Id, configItemIds, ct);

		ValidateAllIdsResolved(configItemIds, items);

		ValidateNoKeyCollisions(batch.Operations, items);
		ValidateOperationSequences(batch.Operations);

		var reduction = Reduce(batch.Operations);
		var ordered = BuildExecutionPlan(reduction);

		return new PreparedBatch(
			actor,
			project,
			environment,
			items,
			ordered);
	}
	
	private static ReductionResult Reduce(IEnumerable<Operation> operations)
	{
		var mutations = new Dictionary<Guid, ItemMutation>();
		var creates = new Dictionary<ConfigKey, CreateItem>();

		foreach (var op in operations)
		{
			switch (op)
			{
				case CreateItem create:
				{
					if (!creates.TryAdd(create.Key, create))
						throw new InvalidBatchOperationException($"Duplicate create for key '{create.Key}'.");

					break;
				}

				case RenameItem rename:
				{
					var mutation = GetOrCreate(mutations, rename.ConfigItemId);
					mutation.NewKey = rename.Key;
					break;
				}

				case SetValue set:
				{
					var mutation = GetOrCreate(mutations, set.ConfigItemId);
					mutation.NewValue = set.Value;
					break;
				}

				case DeleteItem delete:
				{
					var mutation = GetOrCreate(mutations, delete.ConfigItemId);
					mutation.Delete = true;
					break;
				}
			}
		}

		return new ReductionResult(creates.Values.ToList(), mutations);
	}

	private static ItemMutation GetOrCreate(
		Dictionary<Guid, ItemMutation> dict,
		Guid id)
	{
		if (!dict.TryGetValue(id, out var mutation))
		{
			mutation = new ItemMutation(id);
			dict[id] = mutation;
		}

		return mutation;
	}

	private static IReadOnlyList<Operation> BuildExecutionPlan(ReductionResult reduction)
	{
		var result = new List<Operation>();

		// 1. Deletes
		foreach (var m in reduction.Mutations.Values.Where(m => m.Delete))
			result.Add(new DeleteItem(m.ItemId));

		// 2. Renames
		foreach (var m in reduction.Mutations.Values.Where(m => m is { Delete: false, NewKey: not null }))
			result.Add(new RenameItem(m.ItemId, m.NewKey!));

		// 3. Creates
		result.AddRange(reduction.Creates);

		// 4. Set values
		foreach (var m in reduction.Mutations.Values.Where(m => m is { Delete: false, NewValue: not null }))
			result.Add(new SetValue(m.ItemId, m.NewValue!));

		return result;
	}

	private static void ValidateNoKeyCollisions(
		IEnumerable<Operation> operations,
		IReadOnlyDictionary<Guid, ConfigItem> items)
	{
		var renames = operations
			.OfType<RenameItem>()
			.ToList();

		var targetKeys = renames
			.GroupBy(r => r.Key)
			.Where(g => g.Count() > 1)
			.ToList();

		if (targetKeys.Count > 0)
		{
			throw new InvalidBatchOperationException("Multiple items cannot be renamed to the same key.");
		}

		// Detect key swaps (A->B and B->A)
		foreach (var r in renames)
		{
			var target = items.Values
				.FirstOrDefault(i => i.Key == r.Key);

			if (target is null)
				continue;

			var reverseRename = renames
				.FirstOrDefault(x => x.ConfigItemId == target.Id);

			if (reverseRename is not null)
			{
				throw new InvalidBatchOperationException(
					$"Cannot swap keys '{items[r.ConfigItemId].Key}' and '{target.Key}' in a single batch.");
			}
		}
	}
	
	private static void ValidateOperationSequences(IEnumerable<Operation> operations)
	{
		var grouped = operations
			.Select(o => (Operation: o, Id: GetConfigItemIdOrNull(o)))
			.Where(x => x.Id.HasValue)
			.GroupBy(x => x.Id!.Value);

		foreach (var group in grouped)
		{
			var ops = group.Select(x => x.Operation).ToList();

			var deleteIndex = ops.FindIndex(o => o is DeleteItem);

			if (deleteIndex >= 0 && deleteIndex != ops.Count - 1)
				throw new InvalidBatchOperationException($"Cannot perform operations after delete on item '{group.Key}'.");

			if (ops.Count(o => o is DeleteItem) > 1)
				throw new InvalidBatchOperationException($"Multiple delete operations for item '{group.Key}'.");
		}
	}

	private async Task<Dictionary<Guid, ConfigItem>> LoadItems(
		Guid projectId,
		IReadOnlyCollection<Guid> ids,
		CancellationToken ct)
	{
		if (ids.Count == 0)
			return new Dictionary<Guid, ConfigItem>();

		var items = await repository.GetByIdsAsync(projectId, ids, ct);
		return items.ToDictionary(x => x.Id);
	}

	private static IReadOnlyCollection<Guid> ExtractReferencedIds(IEnumerable<Operation> operations)
	{
		return operations
			.Select(GetConfigItemIdOrNull)
			.Where(id => id.HasValue)
			.Select(id => id!.Value)
			.Distinct()
			.ToArray();
	}

	private static Guid? GetConfigItemIdOrNull(Operation operation)
	{
		return operation switch
		{
			RenameItem rename => rename.ConfigItemId,
			SetValue setValue => setValue.ConfigItemId,
			DeleteItem delete => delete.ConfigItemId,
			_ => null
		};
	}

	private static void ValidateAllIdsResolved(
		IReadOnlyCollection<Guid> requested,
		IReadOnlyDictionary<Guid, ConfigItem> loaded)
	{
		var missing = requested.Except(loaded.Keys).ToArray();

		if (missing.Length > 0)
			throw new ConfigItemNotFoundException(missing);
	}

	private static Environment? ResolveEnvironmentIfRequired(
		Project project,
		OperationBatch batch)
	{
		if (!batch.Operations.Any(o => o.RequiresEnvironment))
			return null;

		if (!project.TryGetEnvironment(batch.EnvironmentName!, out var env))
			throw new EnvironmentNotFoundException(batch.EnvironmentName!);

		return env;
	}
	
	
	private sealed class ReductionResult(IReadOnlyList<CreateItem> creates, Dictionary<Guid, ItemMutation> mutations)
	{
		public IReadOnlyList<CreateItem> Creates { get; } = creates;
		public Dictionary<Guid, ItemMutation> Mutations { get; } = mutations;
	}
}