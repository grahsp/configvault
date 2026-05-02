using KeyVault.Api.Authorization;

namespace KeyVault.Api.Invitations;

public static class InvitationEndpoints
{
	public static void AddInvitationEndpoints(this IEndpointRouteBuilder builder)
	{
		var invitations = builder.MapGroup("/projects/{projectId}/invitations/")
			.RequireAuthorization(AuthorizationPolicies.UserOnly)
			.WithTags("Invitations");
		
		invitations.MapGet("", CreateInvitation.Endpoint.Handle);
	}
}
