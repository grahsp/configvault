using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Authorization;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Projects.Queries.GetProject;

public sealed class Handler(
	IActorContext actor,
	IActorAuthorizationService authorizaton,
	IReadDbContext db)
	: IQueryHandler<Query, Response?>
{
	public async Task<Response?> HandleAsync(Query query, CancellationToken ct)
	{
		await authorizaton.EnsureCanAccessProjectAsync(query.ProjectId, actor, ct);
		
		return await db.Projects
			.Where(p => p.Id == query.ProjectId)
			.Select(p => new Response(
				p.Id,
				p.Name,
				p.Members
					.Where(m => m.UserId == actor.Id)
					.Select(m => m.Role)
					.Single(),
				p.CreatedAt))
			.SingleOrDefaultAsync(ct);
	}
}