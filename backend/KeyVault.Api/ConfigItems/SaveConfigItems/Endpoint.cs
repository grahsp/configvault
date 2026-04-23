using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Commands.SaveConfigItems;
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
		var updates = request.Updates.Select(update =>
		{
			ConfigKey? key = null;

			if (update.Key is not null)
			{
				if (!ConfigKey.TryParse(update.Key, out var parsedKey))
					throw new ValidationException("Invalid key format");

				key = parsedKey;
			}

			return new ConfigItemUpdate(update.ConfigItemId, key, update.Value);
		}).ToArray();

		var command = new Command(
			projectId,
			request.Environment,
			updates,
			request.DeleteConfigItemIds);

		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}
}
