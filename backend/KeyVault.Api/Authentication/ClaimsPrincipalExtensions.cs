using System.Security.Claims;

namespace KeyVault.Api.Authentication;

public static class ClaimsPrincipalExtensions
{
	public static bool IsMachine(this ClaimsPrincipal principal)
		=> principal.HasClaim("gty", "client-credentials");
}