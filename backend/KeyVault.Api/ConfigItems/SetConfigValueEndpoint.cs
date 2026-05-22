using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Commands;

namespace KeyVault.Api.ConfigItems;

internal static class SetConfigValueEndpoint
{
	internal static async Task<IResult> Handle(
		ICommandDispatcher dispatcher,
		Guid projectId,
		Guid configItemId,
		string environment,
		SetConfigValueRequest request,
		CancellationToken ct)
	{
		var command = new SetConfigValueCommand(projectId, configItemId, environment, request.Value, request.ExpectedRevision);
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}
}

public sealed record SetConfigValueRequest(string Value, uint ExpectedRevision);
