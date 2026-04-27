using KeyVault.Domain.Identity;
using KeyVault.Domain.Users.Exceptions;

namespace KeyVault.Domain.Users;

public sealed class User
{
	public ActorId Id { get; } = null!;
	
	private readonly List<ExternalLogin> _externalLogins = [];
	public IReadOnlyList<ExternalLogin> ExternalLogins => _externalLogins;
	
	public string? DisplayName { get; private set; }
	
	public UserStatus Status { get; private set; } = UserStatus.Pending;
	public DateTimeOffset CreatedAt { get; private init; }
	public DateTimeOffset? ActivatedAt { get; private set; }

	private User() {}

	private User(Guid id, DateTimeOffset now)
	{ 
		Id = ActorId.User(id);
		CreatedAt = now;
	}

	public static User Create(string issuer, string subject, DateTimeOffset now)
	{
		var user = new User(Guid.NewGuid(), now);
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

	public void Activate(string displayName, DateTimeOffset now)
	{
		ArgumentException.ThrowIfNullOrEmpty(displayName);
		
		if (Status != UserStatus.Pending)
			throw new UserAlreadyActivatedException();
		
		DisplayName = displayName;
		Status = UserStatus.Active;
		ActivatedAt = now;
	}
}
