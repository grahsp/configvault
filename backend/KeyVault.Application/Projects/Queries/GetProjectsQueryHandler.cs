using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Projects.Queries;

public sealed record GetProjectsQuery : IQuery<IReadOnlyList<GetProjectsResponse>>;
public sealed record GetProjectsResponse(Guid Id, string Name, DateTimeOffset CreatedAt);

public sealed class GetProjectsQueryHandler(IActorContext actor, IReadDbContext db)
	: IQueryHandler<GetProjectsQuery, IReadOnlyList<GetProjectsResponse>>
{
	public async Task<IReadOnlyList<GetProjectsResponse>> HandleAsync(GetProjectsQuery query, CancellationToken ct)
	{
		var userId = actor.RequireUserId();

		return await db.Projects
			.Where(x => x.Members.Any(m => m.UserId == userId))
			.OrderBy(x => x.Name)
			.Select(x => new GetProjectsResponse(x.Id, x.Name, x.CreatedAt))
			.ToListAsync(ct);
	}
}
