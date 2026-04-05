namespace KeyVault.Domain.Users;

public sealed class User
{
	public Guid Id { get; private init; }
	
	private List<ExternalLogin> _externalLogins = [];
	public IReadOnlyList<ExternalLogin> ExternalLogins => _externalLogins;
	
	public string? Email { get; private set; } = null!;
	public string? Name { get; private set; }
	
	public DateTimeOffset CreatedAt { get; private init; }

	private User() {}

	private User(Guid id, string? email, string? name, DateTimeOffset now)
	{ 
		Id = id;
		Email = email;
		Name = name;
		CreatedAt = now;
	}

	public static User Create(string? email, string? name, DateTimeOffset now)
		=> new User(Guid.NewGuid(), email, name, now);
	
	public void AddExternalLogin(string issuer, string subject)
	{
		if (_externalLogins.Any(l => l.Issuer == issuer && l.Subject == subject))
			throw new Exception("User already has an external login for this subject");
		
		var login = new ExternalLogin(issuer, subject, Id);
		_externalLogins.Add(login);
	}
}