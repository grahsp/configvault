using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Commands.AddConfigItem;
using KeyVault.Application.Exceptions;
using KeyVault.Domain.ConfigItems;

namespace KeyVault.Api.ConfigItems.AddConfigItem;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(ICommandDispatcher dispatcher, Guid projectId, Request request, CancellationToken ct)
	{
		if (!ConfigKey.TryParse(request.Key, out var key))
			throw new ValidationException("Invalid key format");
		
		var command = new Command(projectId, key);
		var response = await dispatcher.DispatchAsync(command, ct);

		return Results.Ok(response);
	}
}