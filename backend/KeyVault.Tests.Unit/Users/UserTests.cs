using KeyVault.Domain.Users;
using KeyVault.Domain.Users.Exceptions;
using Microsoft.Extensions.Time.Testing;

namespace KeyVault.Tests.Unit.Users;

public sealed class UserTests
{
	private readonly FakeTimeProvider _time = new FakeTimeProvider();

	[Fact]
	public void Create_ShouldCreateUserWithInitialExternalLogin()
	{
		var now = _time.GetUtcNow();
		var user = User.Create("github", "123", "Ada Lovelace", "ada@example.com", now);

		Assert.NotEqual(Guid.Empty, user.Id.Value);
		Assert.Equal("Ada Lovelace", user.DisplayName);
		Assert.Equal("ada@example.com", user.Email);
		Assert.Equal(now, user.CreatedAt);
		Assert.Equal(now, user.ActivatedAt);

		var login = Assert.Single(user.ExternalLogins);
		Assert.Equal("github", login.Issuer);
		Assert.Equal("123", login.Subject);
		Assert.Equal(user.Id, login.UserId);
	}

	[Fact]
	public void AddExternalLogin_ShouldAddLogin()
	{
		var now = _time.GetUtcNow();
		var user = User.Create("entra", "user-123", "User", "user@example.com", now);

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
		var user = User.Create("entra", "user-123", "User", "user@example.com", now);
		user.AddExternalLogin("github", "123");

		var exception = Assert.Throws<DuplicateExternalLoginException>(() => user.AddExternalLogin("github", "123"));

		Assert.Equal("User already has an external login for this subject", exception.Message);
	}

	[Fact]
	public void ApplyIdentityProfile_ShouldSetEmailAndMissingDisplayName()
	{
		var now = _time.GetUtcNow();
		var user = User.Create("entra", "user-123", "", null, now);

		var changed = user.ApplyIdentityProfile("Nickname", "nickname@example.com");

		Assert.True(changed);
		Assert.Equal("Nickname", user.DisplayName);
		Assert.Equal("nickname@example.com", user.Email);
	}

	[Fact]
	public void ApplyIdentityProfile_ShouldNotOverwriteExistingDisplayName()
	{
		var now = _time.GetUtcNow();
		var user = User.Create("entra", "user-123", "Local Name", null, now);

		var changed = user.ApplyIdentityProfile("Token Nickname", "user@example.com");

		Assert.True(changed);
		Assert.Equal("Local Name", user.DisplayName);
		Assert.Equal("user@example.com", user.Email);
	}
}
