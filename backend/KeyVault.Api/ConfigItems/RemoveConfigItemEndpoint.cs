using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Commands;

namespace KeyVault.Api.ConfigItems;

internal static class RemoveConfigItemEndpoint
{
	internal static async Task<IResult> Handle(ICommandDispatcher dispatcher, Guid projectId, Guid configItemId, CancellationToken ct)
	{
		var command = new RemoveConfigItemCommand(projectId, configItemId);
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}
}
