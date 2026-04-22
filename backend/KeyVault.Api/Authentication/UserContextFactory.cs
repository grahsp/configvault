using System.Security.Claims;
using KeyVault.Application.Authentication;
using KeyVault.Api.Authentication.Exceptions;

namespace KeyVault.Api.Authentication;

public class UserContextFactory : IUserContextFactory
{
	public ExternalIdentity Create(ClaimsPrincipal principal)
	{
		var issuer = principal.FindFirstValue("iss")
		             ?? throw new MissingAuthenticationClaimException("iss");
		
		var subject = principal.FindFirstValue(ClaimTypes.NameIdentifier)
		              ?? throw new MissingAuthenticationClaimException(ClaimTypes.NameIdentifier);

		return new ExternalIdentity(issuer, subject);
	}
}
