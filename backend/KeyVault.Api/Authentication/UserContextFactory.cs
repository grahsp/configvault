using System.Security.Claims;
using KeyVault.Application.Authentication;

namespace KeyVault.Api.Authentication;

public class UserContextFactory : IUserContextFactory
{
	public ExternalIdentity Create(ClaimsPrincipal principal)
	{
		var issuer = principal.FindFirstValue("iss")
		             ?? throw new Exception("Missing iss claim");
		
		var subject = principal.FindFirstValue(ClaimTypes.NameIdentifier)
		              ?? throw new Exception("Missing sub claim");

		return new ExternalIdentity(issuer, subject);
	}
}