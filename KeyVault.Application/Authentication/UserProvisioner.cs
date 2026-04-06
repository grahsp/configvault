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
	public async Task<AuthenticatedUser> GetOrProvisionUserAsync(UserContext context, CancellationToken ct)
	{
		var data = await resolver.GetUserAsync(context.Issuer, context.Subject, ct);

		if (data is not null)
			return data;

		var user = User.Create(context.Issuer, context.Subject, time.GetUtcNow());

		users.Add(user);
		await uow.SaveChangesAsync(ct);

		return new AuthenticatedUser(user.Id, user.Status);
	}
}