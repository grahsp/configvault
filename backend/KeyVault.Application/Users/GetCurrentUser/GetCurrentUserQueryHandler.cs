using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.Persistence;
using KeyVault.Application.Users.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Users.GetCurrentUser;

public sealed class GetCurrentUserQueryHandler(IUserContext actor, IReadDbContext db)
	: IQueryHandler<GetCurrentUserQuery, UserView>
{
	public async Task<UserView> HandleAsync(GetCurrentUserQuery query, CancellationToken ct)
	{
		var user = await db.Users
			.Where(x => x.Id == actor.Id)
			.Select(x => new UserView(x.Id.Value, x.DisplayName, x.Status.ToString(), x.CreatedAt))
			.SingleOrDefaultAsync(ct);

		return user ?? throw new UserNotFoundException(actor.Id);
	}
}
