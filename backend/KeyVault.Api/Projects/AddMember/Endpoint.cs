using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Commands.AddMember;
using KeyVault.Domain.Identity;

namespace KeyVault.Api.Projects.AddMember;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(ICommandDispatcher dispatcher, Guid projectId, UserId userId, CancellationToken ct)
	{
		var command = new Command(projectId, userId);
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}
}
