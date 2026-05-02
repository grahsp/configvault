using KeyVault.Api.Authorization;

namespace KeyVault.Api.Invitations;

public static class InvitationEndpoints
{
	public static void AddInvitationEndpoints(this IEndpointRouteBuilder builder)
	{
		var invitations = builder.MapGroup("/projects/{projectId}/invitations/")
			.RequireAuthorization()
			.WithTags("Invitations");

		invitations.MapGet("", ActiveInvitations.Endpoint.Handle);
		invitations.MapPost("", CreateInvitation.Endpoint.Handle);
		invitations.MapPost("/revoke/{invitationId}", RevokeInvitation.Endpoint.Handle);

		builder.MapGet("/invitations/accept/{token}", AcceptInvitation.Endpoint.Handle)
			.RequireAuthorization(AuthorizationPolicies.UserOnly)
			.WithTags("Invitations");
	}
}
