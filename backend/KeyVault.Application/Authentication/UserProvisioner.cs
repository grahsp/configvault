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
	public async Task<AuthenticatedUser> GetOrProvisionUserAsync(ExternalIdentity identity, CancellationToken ct)
	{
		var data = await resolver.GetUserAsync(identity.Issuer, identity.Subject, ct);

		if (data is not null)
			return data;

		var user = User.Create(identity.Issuer, identity.Subject, time.GetUtcNow());

		users.Add(user);
		await uow.SaveChangesAsync(ct);

		return new AuthenticatedUser(user.Id, user.Status, identity.Issuer, identity.Subject);
	}
}
