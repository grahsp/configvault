using KeyVault.Domain.Users;
using Microsoft.Extensions.Time.Testing;

namespace KeyVault.Tests.Unit.Users;

public sealed class UserTests
{
	private readonly FakeTimeProvider _time = new FakeTimeProvider();

	[Fact]
	public void Create_ShouldCreateUserWithInitialExternalLogin()
	{
		var now = _time.GetUtcNow();
		var user = User.Create("github", "123", now);

		Assert.NotEqual(Guid.Empty, user.Id);
		Assert.Null(user.DisplayName);
		Assert.Equal(UserStatus.Pending, user.Status);
		Assert.Equal(now, user.CreatedAt);

		var login = Assert.Single(user.ExternalLogins);
		Assert.Equal("github", login.Issuer);
		Assert.Equal("123", login.Subject);
		Assert.Equal(user.Id, login.UserId);
	}

	[Fact]
	public void AddExternalLogin_ShouldAddLogin()
	{
		var now = _time.GetUtcNow();
		var user = User.Create("entra", "user-123", now);

		user.AddExternalLogin("github", "123");

		Assert.Equal(2, user.ExternalLogins.Count);
		var login = Assert.Single(user.ExternalLogins, l => l.Issuer == "github" && l.Subject == "123");
		Assert.Equal("github", login.Issuer);
		Assert.Equal("123", login.Subject);
		Assert.Equal(user.Id, login.UserId);
	}

	[Fact]
	public void AddExternalLogin_ShouldThrow_WhenLoginAlreadyExists()
	{
		var now = _time.GetUtcNow();
		var user = User.Create("entra", "user-123", now);
		user.AddExternalLogin("github", "123");

		var exception = Assert.Throws<Exception>(() => user.AddExternalLogin("github", "123"));

		Assert.Equal("User already has an external login for this subject", exception.Message);
	}
}
