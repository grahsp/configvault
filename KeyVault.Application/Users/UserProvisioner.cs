using KeyVault.Application.Authentication;
using KeyVault.Application.Persistence;
using KeyVault.Domain.Users;

namespace KeyVault.Application.Users;

public class UserProvisioner(
	IUserRepository users,
	IUnitOfWork uow,
	TimeProvider time)
	: IUserProvisioner
{
	public async Task<User> GetOrProvisionUserAsync(UserContext context, CancellationToken ct)
	{
		var user = await users.GetByExternalIdentityAsync(context.Issuer, context.Subject, ct);

		if (user is not null)
			return user;

		user = User.Create(context.Email, context.Name, time.GetUtcNow());
		user.AddExternalLogin(context.Issuer, context.Subject);

		users.Add(user);
		await uow.SaveChangesAsync(ct);

		return user;
	}
}