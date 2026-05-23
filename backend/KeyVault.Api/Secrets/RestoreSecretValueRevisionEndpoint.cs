using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Commands;

namespace KeyVault.Api.Secrets;

internal static class RestoreSecretValueRevisionEndpoint
{
	internal static async Task<IResult> Handle(
		ICommandDispatcher dispatcher,
		Guid projectId,
		Guid configItemId,
		uint revision,
		string environment,
		RestoreSecretValueRevisionRequest request,
		CancellationToken ct)
	{
		var command = new RestoreConfigValueRevisionCommand(projectId, configItemId, environment, revision, request.ExpectedRevision);
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}
}

public sealed record RestoreSecretValueRevisionRequest(uint ExpectedRevision);
