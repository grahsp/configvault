using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Commands.RemoveMember;

namespace KeyVault.Api.Projects.RemoveMember;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(ICommandDispatcher dispatcher, Guid projectId, Guid userId, CancellationToken ct)
	{
		var command = new Command(projectId, userId);
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}
}
