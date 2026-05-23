using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Commands;
using KeyVault.Application.Exceptions;
using KeyVault.Domain.ConfigItems;

namespace KeyVault.Api.Secrets;

internal static class RenameSecretEndpoint
{
	internal static async Task<IResult> Handle(
		ICommandDispatcher dispatcher,
		Guid projectId,
		Guid configItemId,
		RenameSecretRequest request,
		CancellationToken ct)
	{
		if (!ConfigKey.TryParse(request.Key, out var key))
			throw new ValidationException("Invalid key format");
		
		var command = new RenameConfigItemCommand(projectId, configItemId, key);
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}
}

public sealed record RenameSecretRequest(string Key);
