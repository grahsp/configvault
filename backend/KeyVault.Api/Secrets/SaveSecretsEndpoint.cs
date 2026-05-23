using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.BatchExecution.Models;
using KeyVault.Application.ConfigItems.BatchExecution.Operations;
using KeyVault.Application.ConfigItems.Commands;
using KeyVault.Application.Exceptions;
using KeyVault.Domain.ConfigItems;

namespace KeyVault.Api.Secrets;

internal static class SaveSecretsEndpoint
{
	internal static async Task<IResult> Handle(
		ICommandDispatcher dispatcher,
		Guid projectId,
		SaveSecretsRequest request,
		CancellationToken ct)
	{
		var operations = new List<Operation>();

		foreach (var update in request.Updates)
		{
			if (update.Key is not null)
			{
				if (!ConfigKey.TryParse(update.Key, out var parsedKey))
					throw new ValidationException("Invalid key format");

				operations.Add(new RenameItem(update.ConfigItemId, parsedKey));
			}

			if (update.Value is not null)
			{
				if (update.ExpectedRevision is null)
					throw new ValidationException("Expected revision is required when setting a value.");

				operations.Add(new SetValue(update.ConfigItemId, update.Value, update.ExpectedRevision.Value));
			}
		}

		foreach (var configItemId in request.DeleteConfigItemIds)
			operations.Add(new DeleteItem(configItemId));

		var command = new ExecuteBatchOperationsCommand(projectId, new OperationBatch(operations, request.Environment));
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}
}

public sealed record SaveSecretsRequest(
	string Environment,
	IReadOnlyList<SaveSecretUpdateRequest> Updates,
	IReadOnlyList<Guid> DeleteConfigItemIds);

public sealed record SaveSecretUpdateRequest(
	Guid ConfigItemId,
	string? Key,
	string? Value,
	uint? ExpectedRevision);
