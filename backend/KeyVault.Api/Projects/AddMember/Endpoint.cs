using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Commands.AddMember;

namespace KeyVault.Api.Projects.AddMember;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(ICommandDispatcher dispatcher, Guid projectId, Request request, CancellationToken ct)
	{
		var command = new Command(projectId, request.UserId);
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}
}