using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace KeyVault.Api.Authentication;

public class DevAuthenticationHandler(
	IOptionsMonitor<AuthenticationSchemeOptions> monitor,
	ILoggerFactory logger,
	UrlEncoder urlEncoder)
	: AuthenticationHandler<AuthenticationSchemeOptions>(monitor, logger, urlEncoder)
{
	public static string AuthenticationScheme => "Dev";
	
	protected override Task<AuthenticateResult> HandleAuthenticateAsync()
	{
		if (!Request.Headers.TryGetValue("X-Dev-Sub", out var subject))
			return Task.FromResult(AuthenticateResult.NoResult());

		var nickname = Request.Headers["X-Dev-Nickname"].FirstOrDefault();
		var email = Request.Headers["X-Dev-Email"].FirstOrDefault();
		var grantType = Request.Headers["X-Dev-GrantType"].FirstOrDefault();

		var claims = new List<Claim>
		{
			new Claim("iss", "https://localhost"),
			new Claim(ClaimTypes.NameIdentifier, subject!)
		};

		if (!string.IsNullOrWhiteSpace(grantType))
			claims.Add(new Claim("gty", grantType));

		if (!string.IsNullOrWhiteSpace(nickname))
			claims.Add(new Claim("https://keyvault.com/nickname", nickname));

		if (!string.IsNullOrWhiteSpace(email))
			claims.Add(new Claim("https://keyvault.com/email", email));

		var identity = new ClaimsIdentity(claims, "Dev");
		var principal = new ClaimsPrincipal(identity);

		var ticket = new AuthenticationTicket(principal, "Dev");

		return Task.FromResult(AuthenticateResult.Success(ticket));
	}
}
