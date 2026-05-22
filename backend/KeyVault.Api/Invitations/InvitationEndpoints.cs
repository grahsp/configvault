using KeyVault.Api.Authorization;

namespace KeyVault.Api.Invitations;

public static class InvitationEndpoints
{
	public static void AddInvitationEndpoints(this IEndpointRouteBuilder builder)
	{
		var invitations = builder.MapGroup("/projects/{projectId}/invitations/")
			.RequireAuthorization()
			.WithTags("Invitations");

		invitations.MapGet("", ActiveInvitationsEndpoint.Handle);
		invitations.MapPost("", CreateInvitationEndpoint.Handle);
		invitations.MapPost("/revoke/{invitationId}", RevokeInvitationEndpoint.Handle);

		builder.MapGet("/invitations/accept/{token}", AcceptInvitationEndpoint.Handle)
			.RequireAuthorization(AuthorizationPolicies.UserOnly)
			.WithTags("Invitations");
	}
}
