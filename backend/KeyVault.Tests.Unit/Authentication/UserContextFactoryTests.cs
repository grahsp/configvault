using System.Security.Claims;
using KeyVault.Api.Authentication;
using KeyVault.Api.Authentication.Exceptions;

namespace KeyVault.Tests.Unit.Authentication;

public sealed class UserContextFactoryTests
{
	private readonly UserContextFactory _sut = new();

	[Fact]
	public void Create_ShouldThrow_WhenIssuerClaimIsMissing()
	{
		var principal = new ClaimsPrincipal(new ClaimsIdentity(
		[
			new Claim(ClaimTypes.NameIdentifier, "user-123")
		], "Test"));

		var exception = Assert.Throws<MissingAuthenticationClaimException>(() => _sut.Create(principal));

		Assert.Equal("Missing required authentication claim 'iss'.", exception.Message);
	}

	[Fact]
	public void Create_ShouldThrow_WhenSubjectClaimIsMissing()
	{
		var principal = new ClaimsPrincipal(new ClaimsIdentity(
		[
			new Claim("iss", "https://issuer.example")
		], "Test"));

		var exception = Assert.Throws<MissingAuthenticationClaimException>(() => _sut.Create(principal));

		Assert.Equal($"Missing required authentication claim '{ClaimTypes.NameIdentifier}'.", exception.Message);
	}
}
