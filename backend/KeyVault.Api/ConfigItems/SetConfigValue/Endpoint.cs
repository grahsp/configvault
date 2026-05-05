using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Commands.SetConfigValue;

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
		var command = new Command(projectId, configItemId, environment, request.Value, request.ExpectedRevision);
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}
}
