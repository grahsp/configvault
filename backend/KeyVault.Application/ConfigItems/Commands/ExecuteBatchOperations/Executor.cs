using KeyVault.Application.Abstractions.Cryptography;
using KeyVault.Application.ConfigItems.Exceptions;
using KeyVault.Domain.ConfigItems;
using KeyVault.Domain.Projects;
using ProjectEnvironment = KeyVault.Domain.Projects.Environment;

namespace KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations;

public sealed class Executor(
	IEnvelopeEncryptionService encryption,
	TimeProvider time)
	: IExecutor
{
	public async Task ExecuteAsync(ExecutionContext context, BatchRequest batch, CancellationToken ct)
	{
		foreach (var operation in batch.Operations)
		{
			ct.ThrowIfCancellationRequested();

			switch (operation)
			{
				case CreateItem create:
					HandleCreateItem(context, create);
					break;
				case RenameItem rename:
					HandleRenameItem(context, rename);
					break;
				case SetValue setValue:
					HandleSetValue(context, setValue);
					break;
				case DeleteItem delete:
					HandleDeleteItem(context, delete);
					break;
				default:
					throw new InvalidOperationException($"Unsupported config item operation '{operation.GetType().Name}'.");
			}
		}

		await Task.CompletedTask;
	}

	private void HandleCreateItem(ExecutionContext context, CreateItem create)
	{
		var configItem = ConfigItem.Create(context.Project.Id, create.Key, time.GetUtcNow());
		context.CreatedItems.Add(configItem);
		context.LoadedItems[configItem.Id] = configItem;

		if (create.InitialValue is not null)
			SetConfigItemValue(context.Project, context.Environment, context.ActorId, configItem, create.InitialValue);
	}

	private void HandleRenameItem(ExecutionContext context, RenameItem rename)
	{
		var configItem = LoadConfigItem(context, rename.ConfigItemId);
		configItem.SetKey(rename.Key);
	}

	private void HandleSetValue(ExecutionContext context, SetValue setValue)
	{
		var configItem = LoadConfigItem(context, setValue.ConfigItemId);
		SetConfigItemValue(context.Project, context.Environment, context.ActorId, configItem, setValue.Value);
	}

	private void HandleDeleteItem(ExecutionContext context, DeleteItem delete)
	{
		if (context.DeletedItemIds.Contains(delete.ConfigItemId))
			return;

		if (!context.LoadedItems.TryGetValue(delete.ConfigItemId, out var configItem))
			return;

		context.RemovedItems.Add(configItem);
		context.DeletedItemIds.Add(delete.ConfigItemId);
		context.LoadedItems.Remove(delete.ConfigItemId);
	}

	private static ConfigItem LoadConfigItem(ExecutionContext context, Guid configItemId)
	{
		if (context.DeletedItemIds.Contains(configItemId))
			throw new ConfigItemNotFoundException(configItemId);

		if (context.LoadedItems.TryGetValue(configItemId, out var configItem))
			return configItem;

		throw new ConfigItemNotFoundException(configItemId);
	}

	private void SetConfigItemValue(
		Project project,
		ProjectEnvironment? environment,
		Guid actorId,
		ConfigItem configItem,
		string value)
	{
		ArgumentNullException.ThrowIfNull(environment);
		var encryptedValue = encryption.EncryptSecret(value, project.CurrentDataKey.Value);
		configItem.SetValue(environment.Id, encryptedValue, actorId, time.GetUtcNow());
	}
}
