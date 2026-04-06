namespace KeyVault.Domain.Users;

public sealed class User
{
	public Guid Id { get; private init; }
	
	private readonly List<ExternalLogin> _externalLogins = [];
	public IReadOnlyList<ExternalLogin> ExternalLogins => _externalLogins;
	
	public string? Name { get; private set; }
	
	public UserStatus Status { get; private set; } = UserStatus.PendingOnBoarding;
	public DateTimeOffset CreatedAt { get; private init; }

	private User() {}

	private User(Guid id, DateTimeOffset now)
	{ 
		Id = id;
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
			throw new Exception("User already has an external login for this subject");
		
		var login = new ExternalLogin(issuer, subject, Id);
		_externalLogins.Add(login);
	}
}