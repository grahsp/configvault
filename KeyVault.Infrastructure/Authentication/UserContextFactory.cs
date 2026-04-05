using System.Security.Claims;
using KeyVault.Application.Authentication;

namespace KeyVault.Infrastructure.Authentication;

public class UserContextFactory
{
	public UserContext Create(ClaimsPrincipal principal)
	{
		var issuer = principal.FindFirstValue("iss")
		             ?? throw new Exception("Missing iss claim");
		
		var subject = principal.FindFirstValue("sub")
		              ?? throw new Exception("Missing sub claim");

		var email = principal.FindFirstValue(ClaimTypes.Email);
		var name = principal.FindFirstValue(ClaimTypes.Name);

		return new UserContext(issuer, subject, email, name);
	}
}