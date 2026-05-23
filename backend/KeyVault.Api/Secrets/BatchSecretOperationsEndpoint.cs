using KeyVault.Api.Secrets.BatchOperations.Contracts;
using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.BatchExecution.Models;
using KeyVault.Application.ConfigItems.BatchExecution.Operations;
using KeyVault.Application.ConfigItems.Commands;
using KeyVault.Application.Exceptions;
using KeyVault.Domain.ConfigItems;

namespace KeyVault.Api.Secrets;

internal static class BatchSecretOperationsEndpoint
{
	internal static async Task<IResult> Handle(
		BatchSecretOperationsRequest request,
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
		SecretOperationRequest secretOperationRequest)
		=> secretOperationRequest switch
		{
			CreateSecretOperationRequest create => MapCreate(create),
			SetSecretValueOperationRequest setValue => new SetValue(
				setValue.ConfigItemId,
				setValue.Value,
				setValue.ExpectedRevision),
			RenameSecretOperationRequest rename => MapRename(rename),
			DeleteSecretOperationRequest delete => new DeleteItem(
				delete.ConfigItemId),
			_ => throw new ValidationException("Unsupported batch operation."),
		};

	private static Operation MapCreate(CreateSecretOperationRequest createConfig)
	{
		if (!ConfigKey.TryParse(createConfig.Key, out var parsedKey))
			throw new ValidationException("Invalid key format");

		return new CreateItem(
			parsedKey,
			createConfig.InitialValue);
	}

	private static Operation MapRename(RenameSecretOperationRequest renameConfig)
	{
		if (!ConfigKey.TryParse(renameConfig.Key, out var parsedKey))
			throw new ValidationException("Invalid key format");

		return new RenameItem(
			renameConfig.ConfigItemId,
			parsedKey);
	}
}

public sealed record BatchSecretOperationsRequest(
	string Environment,
	IReadOnlyList<SecretOperationRequest> Operations);
