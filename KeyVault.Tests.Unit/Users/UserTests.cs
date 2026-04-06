using KeyVault.Domain.Users;
using Microsoft.Extensions.Time.Testing;

namespace KeyVault.Tests.Unit.Users;

public sealed class UserTests
{
	private readonly FakeTimeProvider _time = new FakeTimeProvider();

	[Fact]
	public void Create_ShouldCreateUserWithProvidedValues()
	{
		var now = _time.GetUtcNow();
		var user = User.Create("user@example.com", "Test User", now);

		Assert.NotEqual(Guid.Empty, user.Id);
		Assert.Equal("user@example.com", user.Email);
		Assert.Equal("Test User", user.Name);
		Assert.Equal(now, user.CreatedAt);
		Assert.Empty(user.ExternalLogins);
	}

	[Fact]
	public void Create_ShouldCreateUser_WhenNullEmailAndName()
	{
		var now = _time.GetUtcNow();
		var user = User.Create(null, null, now);

		Assert.Null(user.Email);
		Assert.Null(user.Name);
		Assert.Equal(now, user.CreatedAt);
	}

	[Fact]
	public void AddExternalLogin_ShouldAddLogin()
	{
		var now = _time.GetUtcNow();
		var user = User.Create("user@example.com", "Test User", now);

		user.AddExternalLogin("github", "123");

		var login = Assert.Single(user.ExternalLogins);
		Assert.Equal("github", login.Issuer);
		Assert.Equal("123", login.Subject);
		Assert.Equal(user.Id, login.UserId);
	}

	[Fact]
	public void AddExternalLogin_ShouldThrow_WhenLoginAlreadyExists()
	{
		var now = _time.GetUtcNow();
		var user = User.Create("user@example.com", "Test User", now);
		user.AddExternalLogin("github", "123");

		var exception = Assert.Throws<Exception>(() => user.AddExternalLogin("github", "123"));

		Assert.Equal("User already has an external login for this subject", exception.Message);
	}
}
