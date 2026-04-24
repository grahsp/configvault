using System.Text.Json;
using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations;
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

	private static async Task<BatchRequest> ReadRequestAsync(HttpRequest httpRequest, CancellationToken ct)
	{
		try
		{
			var request = await httpRequest.ReadFromJsonAsync<BatchRequest>(cancellationToken: ct);

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

	private static KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations.Operation MapOperation(
		Operation operation)
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
