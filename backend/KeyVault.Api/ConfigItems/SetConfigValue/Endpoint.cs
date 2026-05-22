using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Commands;

namespace KeyVault.Api.ConfigItems.SetConfigValue;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(
		ICommandDispatcher dispatcher,
		Guid projectId,
		Guid configItemId,
		string environment,
		Request request,
		CancellationToken ct)
	{
		var command = new SetConfigValueCommand(projectId, configItemId, environment, request.Value, request.ExpectedRevision);
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}
}
