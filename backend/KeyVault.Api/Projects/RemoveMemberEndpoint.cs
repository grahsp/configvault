using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Commands;
using KeyVault.Domain.Identity;

namespace KeyVault.Api.Projects;

internal static class RemoveMemberEndpoint
{
	internal static async Task<IResult> Handle(ICommandDispatcher dispatcher, Guid projectId, UserId userId, CancellationToken ct)
	{
		var command = new RemoveMemberCommand(projectId, userId);
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}
}
