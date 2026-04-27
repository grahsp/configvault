using System.Security.Claims;
using KeyVault.Api.Authentication.Exceptions;
using KeyVault.Application.Authentication;

namespace KeyVault.Api.Authentication;

public static class ClaimsPrincipalExtensions
{
	public static bool IsMachine(this ClaimsPrincipal principal)
		=> principal.HasClaim("gty", "client-credentials");
	
	public static ExternalIdentity GetExternalIdentity(this ClaimsPrincipal principal)
	{
		var issuer = principal.FindFirstValue("iss")
		             ?? throw new MissingAuthenticationClaimException("iss");

		var subject = principal.FindFirstValue(ClaimTypes.NameIdentifier)
		              ?? throw new MissingAuthenticationClaimException(ClaimTypes.NameIdentifier);

		return new ExternalIdentity(issuer, subject);
	}
}