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

		var claims = new[]
		{
			new Claim("iss", "https://localhost"),
			new Claim("sub", subject!),
			new Claim(ClaimTypes.Name, "dev-username"),
			new Claim(ClaimTypes.Email, "dev-email")
		};

		var identity = new ClaimsIdentity(claims, "Dev");
		var principal = new ClaimsPrincipal(identity);

		var ticket = new AuthenticationTicket(principal, "Dev");

		return Task.FromResult(AuthenticateResult.Success(ticket));
	}
}