using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Invitations.Queries;

namespace KeyVault.Api.Invitations;

internal static class ActiveInvitationsEndpoint
{
	internal static async Task<IResult> Handle(IQueryDispatcher dispatcher, Guid projectId, CancellationToken ct)
	{
		var query = new ActiveInvitationsQuery(projectId);
		var items = await dispatcher.DispatchAsync(query, ct);

		return Results.Ok(items);
	}
}
