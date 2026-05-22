using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Persistence;
using KeyVault.Application.Users.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Users.Queries;

public sealed record GetCurrentUserQuery : IQuery<GetCurrentUserResponse>;
public sealed record GetCurrentUserResponse(string Id, string? Email, string? DisplayName, DateTimeOffset CreatedAt);

public sealed class GetCurrentUserQueryHandler(IActorContext actor, IReadDbContext db)
	: IQueryHandler<GetCurrentUserQuery, GetCurrentUserResponse>
{
	public async Task<GetCurrentUserResponse> HandleAsync(GetCurrentUserQuery query, CancellationToken ct)
	{
		var userId = actor.RequireUserId();

		var user = await db.Users
			.Where(x => x.Id == userId)
			.Select(x => new GetCurrentUserResponse(x.Id.ToString(), x.Email, x.DisplayName, x.CreatedAt))
			.SingleOrDefaultAsync(ct);

		return user ?? throw new UserNotFoundException(userId);
	}
}
