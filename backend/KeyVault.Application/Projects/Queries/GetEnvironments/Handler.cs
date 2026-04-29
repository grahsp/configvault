using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.ConfigItems.Queries.GetConfigItems;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Projects.Queries.GetEnvironments;

public class Handler(IActorContext actor, IReadDbContext db) : IQueryHandler<Query, IReadOnlyList<Response>>
{
	public async Task<IReadOnlyList<Response>> HandleAsync(Query query, CancellationToken ct)
	{
		var userId = actor.RequireUserId();
		
		return await db.Projects
			.Where(p => p.Id == query.ProjectId)
			.Where(p => p.Members
				.Any(m => p.Id == query.ProjectId && m.UserId == userId))
			.SelectMany(p => p.Environments)
			.OrderBy(e => e.CreatedAt)
			.Select(e => new Response(e.Id, e.Name))
			.ToListAsync(ct);
	}
}