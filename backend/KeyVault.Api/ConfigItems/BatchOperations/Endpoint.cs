using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations;
using KeyVault.Application.Exceptions;
using KeyVault.Domain.ConfigItems;

namespace KeyVault.Api.ConfigItems.BatchOperations;

internal static class BatchOperationsEndpoint
{
	internal static async Task<IResult> Handle(
		ICommandDispatcher dispatcher,
		Guid projectId,
		BatchRequest request,
		CancellationToken ct)
	{
		var operations = new List<KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations.Operation>(request.Operations.Count);

		foreach (var operation in request.Operations)
			operations.Add(MapOperation(operation));

		var command = new Command(
			projectId,
			request.Environment,
			new KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations.BatchRequest(operations));

		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}

	private static KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations.Operation MapOperation(
		ConfigItems.BatchOperations.Operation operation)
		=> operation switch
		{
			CreateItem create => MapCreate(create),
			SetValue setValue => new KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations.SetValue(
				setValue.ConfigItemId,
				setValue.Value),
			RenameItem rename => MapRename(rename),
			DeleteItem delete => new KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations.DeleteItem(
				delete.ConfigItemId),
			_ => throw new ValidationException("Unsupported batch operation."),
		};

	private static KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations.Operation MapCreate(CreateItem create)
	{
		if (!ConfigKey.TryParse(create.Key, out var parsedKey))
			throw new ValidationException("Invalid key format");

		return new KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations.CreateItem(
			parsedKey,
			create.InitialValue);
	}

	private static KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations.Operation MapRename(RenameItem rename)
	{
		if (!ConfigKey.TryParse(rename.Key, out var parsedKey))
			throw new ValidationException("Invalid key format");

		return new KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations.RenameItem(
			rename.ConfigItemId,
			parsedKey);
	}
}
