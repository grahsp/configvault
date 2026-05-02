using KeyVault.Domain.Identity;
using KeyVault.Domain.Users.Exceptions;

namespace KeyVault.Domain.Users;

public sealed class User
{
	public UserId Id { get; }
	
	private readonly List<ExternalLogin> _externalLogins = [];
	public IReadOnlyList<ExternalLogin> ExternalLogins => _externalLogins;

	public string DisplayName { get; private set; } = null!;
	public string? Email { get; private set; }
	public DateTimeOffset CreatedAt { get; private init; }
	public DateTimeOffset? ActivatedAt { get; private set; }

	private User() {}

	private User(UserId id, DateTimeOffset now)
	{ 
		Id = id;
		CreatedAt = now;
	}

	public static User Create(string issuer, string subject, string displayName, string? email, DateTimeOffset now)
	{
		var user = new User(UserId.New(), now)
		{
			DisplayName = displayName,
			Email = Normalize(email),
			ActivatedAt = now
		};

		user.AddExternalLogin(issuer, subject);

		return user;
	}
	
	public void AddExternalLogin(string issuer, string subject)
	{
		if (_externalLogins.Any(l => l.Issuer == issuer && l.Subject == subject))
			throw new DuplicateExternalLoginException();
		
		var login = new ExternalLogin(issuer, subject, Id);
		_externalLogins.Add(login);
	}

	public bool ApplyIdentityProfile(string? nickname, string? email)
	{
		var changed = false;
		var normalizedNickname = Normalize(nickname);
		var normalizedEmail = Normalize(email);

		if (string.IsNullOrWhiteSpace(DisplayName) && normalizedNickname is not null)
		{
			DisplayName = normalizedNickname;
			changed = true;
		}

		if (normalizedEmail is not null && !string.Equals(Email, normalizedEmail, StringComparison.Ordinal))
		{
			Email = normalizedEmail;
			changed = true;
		}

		return changed;
	}

	private static string? Normalize(string? value)
	{
		if (string.IsNullOrWhiteSpace(value))
			return null;

		return value.Trim();
	}
}
