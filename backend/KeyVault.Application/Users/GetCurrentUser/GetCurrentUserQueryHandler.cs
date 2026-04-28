using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Persistence;
using KeyVault.Application.Users.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Users.GetCurrentUser;

public sealed class GetCurrentUserQueryHandler(IActorContext actor, IReadDbContext db)
	: IQueryHandler<GetCurrentUserQuery, UserView>
{
	public async Task<UserView> HandleAsync(GetCurrentUserQuery query, CancellationToken ct)
	{
		var userId = actor.RequireUserId();

		var user = await db.Users
			.Where(x => x.Id == userId)
			.Select(x => new UserView(x.Id.ToString(), x.DisplayName, x.Status.ToString(), x.CreatedAt))
			.SingleOrDefaultAsync(ct);

		return user ?? throw new UserNotFoundException(userId);
	}
}
