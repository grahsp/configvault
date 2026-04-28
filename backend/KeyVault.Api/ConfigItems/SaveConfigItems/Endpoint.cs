using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.BatchExecution.Models;
using KeyVault.Application.ConfigItems.BatchExecution.Operations;
using KeyVault.Application.ConfigItems.Commands.BatchOperations;
using KeyVault.Application.Exceptions;
using KeyVault.Domain.ConfigItems;

namespace KeyVault.Api.ConfigItems.SaveConfigItems;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(
		ICommandDispatcher dispatcher,
		Guid projectId,
		Request request,
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
				operations.Add(new SetValue(update.ConfigItemId, update.Value));
		}

		foreach (var configItemId in request.DeleteConfigItemIds)
			operations.Add(new DeleteItem(configItemId));

		var command = new Command(projectId, new OperationBatch(operations, request.Environment));
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}
}
