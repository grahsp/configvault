using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Projects.Commands.AddMember;
using KeyVault.Domain.Actors;

namespace KeyVault.Api.Projects.AddMember;

internal static class Endpoint
{
	internal static async Task<IResult> Handle(ICommandDispatcher dispatcher, Guid projectId, ActorId actorId, CancellationToken ct)
	{
		var command = new Command(projectId, actorId);
		await dispatcher.DispatchAsync(command, ct);

		return Results.NoContent();
	}
}