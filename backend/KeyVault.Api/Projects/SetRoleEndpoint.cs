using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Commands;
using KeyVault.Domain.Identity;
using KeyVault.Domain.Projects;

namespace KeyVault.Api.Projects;

internal static class SetRoleEndpoint
{
	internal static async Task<IResult> Handle(
		ICommandDispatcher dispatcher,
		Guid projectId,
		UserId userId,
		SetRoleRequest request,
		CancellationToken ct)
	{
		var command = new SetRoleCommand(projectId, userId, request.Role);
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}
}

public sealed record SetRoleRequest(ProjectRole Role);
