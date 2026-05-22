using KeyVault.Api.ConfigItems.BatchOperations.Operations;
using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.BatchExecution.Models;
using KeyVault.Application.ConfigItems.BatchExecution.Operations;
using KeyVault.Application.ConfigItems.Commands;
using KeyVault.Application.Exceptions;
using KeyVault.Domain.ConfigItems;

namespace KeyVault.Api.ConfigItems.BatchOperations;

internal static class BatchOperationsEndpoint
{
	internal static async Task<IResult> Handle(
		Request request,
		ICommandDispatcher dispatcher,
		Guid projectId,
		CancellationToken ct)
	{
		var operations = new List<Operation>(request.Operations.Count);

		foreach (var operation in request.Operations)
			operations.Add(MapOperation(operation));

		var command = new ExecuteBatchOperationsCommand(projectId, new OperationBatch(operations, request.Environment));
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}

	private static Operation MapOperation(
		ConfigItemOperationRequest configItemOperationRequest)
		=> configItemOperationRequest switch
		{
			CreateConfigItemRequest create => MapCreate(create),
			SetConfigItemValueRequest setValue => new SetValue(
				setValue.ConfigItemId,
				setValue.Value,
				setValue.ExpectedRevision),
			RenameConfigItemRequest rename => MapRename(rename),
			DeleteConfigItemRequest delete => new DeleteItem(
				delete.ConfigItemId),
			_ => throw new ValidationException("Unsupported batch operation."),
		};

	private static Operation MapCreate(CreateConfigItemRequest createConfig)
	{
		if (!ConfigKey.TryParse(createConfig.Key, out var parsedKey))
			throw new ValidationException("Invalid key format");

		return new CreateItem(
			parsedKey,
			createConfig.InitialValue);
	}

	private static Operation MapRename(RenameConfigItemRequest renameConfig)
	{
		if (!ConfigKey.TryParse(renameConfig.Key, out var parsedKey))
			throw new ValidationException("Invalid key format");

		return new RenameItem(
			renameConfig.ConfigItemId,
			parsedKey);
	}
}
