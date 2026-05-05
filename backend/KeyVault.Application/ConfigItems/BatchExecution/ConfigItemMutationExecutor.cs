using KeyVault.Application.Abstractions.Cryptography;
using KeyVault.Application.Actors;
using KeyVault.Application.ConfigItems.BatchExecution.Models;
using KeyVault.Application.ConfigItems.BatchExecution.Operations;
using KeyVault.Application.ConfigItems.Exceptions;
using KeyVault.Application.Persistence;
using KeyVault.Domain.ConfigItems;
using KeyVault.Domain.ConfigItems.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.ConfigItems.BatchExecution;

public sealed class ConfigItemMutationExecutor(
	IConfigItemRepository configurations,
	IEnvelopeEncryptionService encryption,
	IActorContext actor,
	IUnitOfWork uow,
	TimeProvider time)
	: IConfigItemMutationExecutor
{
	public async Task ExecuteAsync(PreparedBatch batch, CancellationToken ct)
	{
		foreach (var operation in batch.Operations)
			ApplyOperation(batch, operation);
        
		PersistChanges(batch);

		try
		{
			await uow.SaveChangesAsync(ct);
		}
		catch (DbUpdateConcurrencyException)
		{
			throw new ConcurrentConfigValueUpdateException();
		}
		catch (DbUpdateException ex) when (IsUniqueConstraintViolation(ex))
		{
			if (IsConfigValueUniqueConstraintViolation(ex))
				throw new ConcurrentConfigValueUpdateException();

			throw new ConfigItemAlreadyExistsException(FindCreatedKey(batch.Operations));
		}
	}
	
	private void PersistChanges(PreparedBatch batch)
	{
		foreach (var item in batch.CreatedItems)
			configurations.Add(item);

		foreach (var item in batch.RemovedItems)
			configurations.Remove(item);
	}
    
	private void ApplyOperation(PreparedBatch batch, Operation operation)
	{
		switch (operation)
		{
			case CreateItem create:
				HandleCreate(batch, create);
				break;

			case RenameItem rename:
				HandleRename(batch, rename);
				break;

			case SetValue setValue:
				HandleSetValue(batch, setValue);
				break;

			case DeleteItem delete:
				HandleDelete(batch, delete);
				break;

			default:
				throw new InvalidOperationException($"Unsupported operation '{operation.GetType().Name}'.");
		}
	}

	private void HandleCreate(PreparedBatch batch, CreateItem create)
	{
		var configItem = ConfigItem.Create(
			batch.Project.Id,
			create.Key,
			time.GetUtcNow());

		batch.CreatedItems.Add(configItem);
		batch.Items[configItem.Id] = configItem;

		if (create.InitialValue is not null)
			SetValue(batch, configItem, new SetValue(configItem.Id, create.InitialValue, 0));
	}

	private void HandleRename(PreparedBatch batch, RenameItem rename)
	{
		var item = GetItem(batch, rename.ConfigItemId);
		item.SetKey(rename.Key);
	}

	private void HandleSetValue(PreparedBatch batch, SetValue setValue)
	{
		var item = GetItem(batch, setValue.ConfigItemId);
		SetValue(batch, item, setValue);
	}

	private void HandleDelete(PreparedBatch batch, DeleteItem delete)
	{
		if (batch.DeletedItemIds.Contains(delete.ConfigItemId))
			return;

		var item = batch.Items[delete.ConfigItemId];

		batch.RemovedItems.Add(item);
		batch.DeletedItemIds.Add(delete.ConfigItemId);
		batch.Items.Remove(delete.ConfigItemId);
	}

	private static ConfigItem GetItem(PreparedBatch batch, Guid id)
	{
		if (batch.DeletedItemIds.Contains(id))
			throw new ConfigItemNotFoundException(id);

		return batch.Items[id];
	}

	private void SetValue(
		PreparedBatch batch,
		ConfigItem item,
		SetValue setValue)
	{
		var environment = batch.Environment
			?? throw new InvalidOperationException("Environment is required.");

		if (item.TryGetValue(environment.Id, out var current))
		{
			if (current.Revision != setValue.ExpectedRevision)
				throw new StaleConfigValueRevisionException(setValue.ExpectedRevision, current.Revision);

			var currentPlaintext = encryption.DecryptSecret(current.Value, batch.Project.CurrentDataKey.Value);
			if (currentPlaintext == setValue.Value)
				return;
		}

		var encrypted = encryption.EncryptSecret(setValue.Value, batch.Project.CurrentDataKey.Value);
		var revision = item.SetValue(
			environment.Id,
			encrypted,
			actor.Id,
			time.GetUtcNow(),
			setValue.ExpectedRevision);
		configurations.AddRevision(revision);
	}
	
	private static ConfigKey FindCreatedKey(IEnumerable<Operation> operations)
		=> operations.OfType<CreateItem>().First().Key;

	private static bool IsUniqueConstraintViolation(DbUpdateException ex)
		=> ex.InnerException?.GetType().FullName == "Npgsql.PostgresException" &&
		   ex.InnerException.GetType().GetProperty("SqlState")?.GetValue(ex.InnerException)?.ToString() == "23505";

	private static bool IsConfigValueUniqueConstraintViolation(DbUpdateException ex)
	{
		var constraintName = ex.InnerException?.GetType().GetProperty("ConstraintName")?.GetValue(ex.InnerException)?.ToString();
		return constraintName is "PK_config_values" or "PK_config_value_revisions";
	}
}
