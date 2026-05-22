using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Commands;

namespace KeyVault.Api.ConfigItems;

internal static class RestoreConfigValueRevisionEndpoint
{
	internal static async Task<IResult> Handle(
		ICommandDispatcher dispatcher,
		Guid projectId,
		Guid configItemId,
		uint revision,
		string environment,
		RestoreConfigValueRevisionRequest request,
		CancellationToken ct)
	{
		var command = new RestoreConfigValueRevisionCommand(projectId, configItemId, environment, revision, request.ExpectedRevision);
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}
}

public sealed record RestoreConfigValueRevisionRequest(uint ExpectedRevision);
