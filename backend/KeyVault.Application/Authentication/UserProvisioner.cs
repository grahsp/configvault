using KeyVault.Application.Persistence;
using KeyVault.Application.Users;
using KeyVault.Domain.Users;

namespace KeyVault.Application.Authentication;

public class UserProvisioner(
	IUserIdentityResolver resolver,
	IUserRepository users,
	IUnitOfWork uow,
	TimeProvider time)
	: IUserProvisioner
{
	public async Task<ResolvedUser> GetOrProvisionUserAsync(ExternalIdentity identity, CancellationToken ct)
	{
		var data = await resolver.GetUserAsync(identity, ct);

		if (data is not null)
		{
			var existingUser = await users.GetByIdAsync(data.Id, ct);
			if (existingUser is not null && existingUser.ApplyIdentityProfile(identity.Nickname, identity.Email))
				await uow.SaveChangesAsync(ct);

			return data;
		}

		var now = time.GetUtcNow();
		var user = User.Create(
			identity.Issuer,
			identity.Subject,
			GetInitialDisplayName(identity),
			identity.Email,
			now);

		users.Add(user);
		await uow.SaveChangesAsync(ct);

		return new ResolvedUser(user.Id);
	}

	private static string GetInitialDisplayName(ExternalIdentity identity)
	{
		if (!string.IsNullOrWhiteSpace(identity.Nickname))
			return identity.Nickname.Trim();

		var subject = identity.Subject;
		const string auth0Prefix = "auth0|";
		var normalizedSubject = subject.StartsWith(auth0Prefix, StringComparison.Ordinal)
			? subject[auth0Prefix.Length..]
			: subject;

		if (string.IsNullOrWhiteSpace(normalizedSubject))
			normalizedSubject = subject;

		var suffixLength = Math.Min(6, normalizedSubject.Length);
		var suffix = normalizedSubject[..suffixLength];

		return $"user-{suffix}";
	}
}
