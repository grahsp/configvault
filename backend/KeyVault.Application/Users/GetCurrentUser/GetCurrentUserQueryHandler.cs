using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Users.GetCurrentUser;

public sealed class GetCurrentUserQueryHandler(IUserContext currentUser, IReadDbContext db)
	: IQueryHandler<GetCurrentUserQuery, UserView?>
{
	public Task<UserView?> HandleAsync(GetCurrentUserQuery query, CancellationToken ct)
	{
		return db.Users
			.Where(x => x.Id == currentUser.UserId)
			.Select(x => new UserView(x.Id, x.DisplayName, x.Status.ToString(), x.CreatedAt))
			.SingleOrDefaultAsync(ct);
	}
}