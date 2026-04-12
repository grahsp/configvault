using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Commands.RemoveConfigItem;

namespace KeyVault.Api.ConfigItems.RemoveConfigItem;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(ICommandDispatcher dispatcher, Guid projectId, Guid configItemId, CancellationToken ct)
	{
		var command = new Command(projectId, configItemId);
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}
}
