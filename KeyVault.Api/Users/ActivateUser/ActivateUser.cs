using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Users.ActivateUser;

namespace KeyVault.Api.Users.ActivateUser;

internal static class ActivateUser
{
	internal static async Task<IResult> Handle(ICommandDispatcher dispatcher, ActivateUserRequest request, CancellationToken ct)
	{
		var command = new ActivateUserCommand(request.DisplayName);
		await dispatcher.DispatchAsync(command, ct);
		
		return Results.Ok();
	}
}