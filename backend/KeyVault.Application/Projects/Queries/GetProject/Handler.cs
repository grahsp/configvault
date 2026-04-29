using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Projects.Queries.GetProject;

public sealed class Handler(
	IActorContext actor,
	IReadDbContext db)
	: IQueryHandler<Query, Response?>
{
	public async Task<Response?> HandleAsync(Query query, CancellationToken ct)
	{
		var userId = actor.RequireUserId();

		return await db.Projects
			.Where(p => p.Id == query.ProjectId)
			.Where(p => p.Members
				.Any(m => p.Id == query.ProjectId && m.UserId == userId))
			.Select(p => new Response(
				p.Id,
				p.Name,
				p.Members
					.Where(m => m.UserId == userId)
					.Select(m => m.Role)
					.Single(),
				p.CreatedAt))
			.SingleOrDefaultAsync(ct);
	}
}
