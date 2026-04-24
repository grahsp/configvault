using KeyVault.Application.Authentication;
using KeyVault.Application.ConfigItems.Exceptions;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.ConfigItems;
using KeyVault.Domain.Projects;
using Microsoft.EntityFrameworkCore;
using ProjectEnvironment = KeyVault.Domain.Projects.Environment;

namespace KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations;

public sealed class Processor(
	IUserContext user,
	IProjectRepository projects,
	IConfigItemRepository configurations,
	IUnitOfWork uow,
	IExecutor executor)
	: IProcessor
{
	public async Task ExecuteAsync(Command command, CancellationToken ct)
	{
		command.Validate();

		var project = await projects.GetByIdAsync(command.ProjectId, ct)
			?? throw new ProjectNotFoundException(command.ProjectId);

		project.RequireMemberWithRole(user.UserId, ProjectRole.Admin);

		var environment = ResolveEnvironmentIfRequired(command, project);
		await EnsureCreateKeysAreAvailableAsync(project.Id, command.Batch.Operations, ct);

		var loadedItems = await LoadReferencedItemsAsync(command.ProjectId, command.Batch.Operations, ct);
		var deletedItemIds = new HashSet<Guid>();
		var createdItems = new List<ConfigItem>();
		var removedItems = new List<ConfigItem>();

		var context = new ExecutionContext(
			project,
			user.UserId,
			environment,
			loadedItems,
			deletedItemIds,
			createdItems,
			removedItems);

		await executor.ExecuteAsync(context, command.Batch, ct);

		foreach (var configItem in createdItems)
			configurations.Add(configItem);

		foreach (var configItem in removedItems)
			configurations.Remove(configItem);

		try
		{
			await uow.SaveChangesAsync(ct);
		}
		catch (DbUpdateException ex) when (IsUniqueConstraintViolation(ex))
		{
			throw new ConfigItemAlreadyExistsException(FindCreatedKey(command.Batch.Operations));
		}
	}

	private async Task EnsureCreateKeysAreAvailableAsync(Guid projectId, IEnumerable<Operation> operations, CancellationToken ct)
	{
		foreach (var create in operations.OfType<CreateItem>())
		{
			if (await configurations.ExistsAsync(projectId, create.Key, ct))
				throw new ConfigItemAlreadyExistsException(create.Key);
		}
	}

	private async Task<Dictionary<Guid, ConfigItem>> LoadReferencedItemsAsync(
		Guid projectId,
		IEnumerable<Operation> operations,
		CancellationToken ct)
	{
		var itemIds = operations
			.Select(GetConfigItemIdOrNull)
			.Where(id => id.HasValue)
			.Select(id => id!.Value)
			.Distinct()
			.ToArray();

		var loadedItems = new Dictionary<Guid, ConfigItem>();

		foreach (var itemId in itemIds)
		{
			var configItem = await configurations.GetByIdAsync(itemId, ct);

			if (configItem is not null && configItem.ProjectId == projectId)
				loadedItems[itemId] = configItem;
		}

		return loadedItems;
	}

	private static Guid? GetConfigItemIdOrNull(Operation operation)
		=> operation switch
		{
			RenameItem rename => rename.ConfigItemId,
			SetValue setValue => setValue.ConfigItemId,
			DeleteItem delete => delete.ConfigItemId,
			_ => null
		};

	private static ConfigKey FindCreatedKey(IEnumerable<Operation> operations)
		=> operations.OfType<CreateItem>().Last().Key;

	private static ProjectEnvironment? ResolveEnvironmentIfRequired(Command command, Project project)
	{
		if (!command.Batch.Operations.Any(operation => operation.RequiresEnvironment))
			return null;

		if (!project.TryGetEnvironment(command.EnvironmentName!, out var environment))
			throw new EnvironmentNotFoundException(command.EnvironmentName!);

		return environment;
	}

	private static bool IsUniqueConstraintViolation(DbUpdateException ex)
		=> ex.InnerException?.GetType().FullName == "Npgsql.PostgresException" &&
		   ex.InnerException.GetType().GetProperty("SqlState")?.GetValue(ex.InnerException)?.ToString() == "23505";
}
