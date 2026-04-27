using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Projects.Queries.GetProjects;

public class Handler(IActorContext actor, IReadDbContext db)
	: IQueryHandler<Query, IReadOnlyList<Response>>
{
	public async Task<IReadOnlyList<Response>> HandleAsync(Query query, CancellationToken ct)
	{
		return await db.Projects
			.Where(x => x.Members.Any(m => m.UserId == actor.Id))
			.OrderBy(x => x.Name)
			.Select(x => new Response(x.Id, x.Name, x.CreatedAt))
			.ToListAsync(ct);
	}
}