using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Projects.Queries.GetMembers;

public class Handler(IActorContext actor, IReadDbContext db) : IQueryHandler<Query, IReadOnlyList<Response>>
{
	public async Task<IReadOnlyList<Response>> HandleAsync(Query query, CancellationToken ct)
	{
		var userId = actor.RequireUserId();
		
		return await db.ProjectMembers
			.Where(m => m.ProjectId == query.ProjectId)
			.Where(m => db.ProjectMembers
				.Any(u => u.ProjectId == m.ProjectId && u.UserId == userId))
			.OrderBy(m => m.Role)
			.Join(db.Users,
				u => u.UserId,
				u => u.Id,
				(m, u) => new Response(
					u.Id.ToString(),
					u.DisplayName,
					m.Role,
					u.Id == userId))
			.ToListAsync(ct);
	}
}