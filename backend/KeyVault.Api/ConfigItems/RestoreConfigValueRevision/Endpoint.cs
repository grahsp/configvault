using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Commands.RestoreConfigValueRevision;

namespace KeyVault.Api.ConfigItems.RestoreConfigValueRevision;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(
		ICommandDispatcher dispatcher,
		Guid projectId,
		Guid configItemId,
		uint revision,
		string environment,
		Request request,
		CancellationToken ct)
	{
		var command = new Command(projectId, configItemId, environment, revision, request.ExpectedRevision);
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}
}
