using System.Text.Json;
using KeyVault.Api.ConfigItems.BatchOperations.Operations;
using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.BatchExecution.Models;
using KeyVault.Application.ConfigItems.BatchExecution.Operations;
using KeyVault.Application.ConfigItems.Commands.BatchOperations;
using KeyVault.Application.Exceptions;
using KeyVault.Domain.ConfigItems;

namespace KeyVault.Api.ConfigItems.BatchOperations;

internal static class BatchOperationsEndpoint
{
	internal static async Task<IResult> Handle(
		HttpRequest httpRequest,
		ICommandDispatcher dispatcher,
		Guid projectId,
		CancellationToken ct)
	{
		var request = await ReadRequestAsync(httpRequest, ct);
		var operations = new List<Operation>(request.Operations.Count);

		foreach (var operation in request.Operations)
			operations.Add(MapOperation(operation));

		var command = new Command(projectId, new OperationBatch(operations, request.Environment));
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}

	private static async Task<Request> ReadRequestAsync(HttpRequest httpRequest, CancellationToken ct)
	{
		try
		{
			var request = await httpRequest.ReadFromJsonAsync<Request>(cancellationToken: ct);

			if (request is null)
				throw new ValidationException("Request body is required.");

			return request;
		}
		catch (JsonException ex)
		{
			throw new ValidationException(ex.Message);
		}
		catch (NotSupportedException ex)
		{
			throw new ValidationException(ex.Message);
		}
	}

	private static Operation MapOperation(
		ConfigItemOperationRequest configItemOperationRequest)
		=> configItemOperationRequest switch
		{
			CreateConfigItemRequest create => MapCreate(create),
			SetConfigItemValueRequest setValue => new SetValue(
				setValue.ConfigItemId,
				setValue.Value),
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
