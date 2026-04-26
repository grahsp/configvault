using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.Authorization;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Projects.Queries.GetEnvironments;

public class Handler(
	IUserContext actor,
	IActorAuthorizationService authorization,
	IReadDbContext db)
	: IQueryHandler<Query, IReadOnlyList<Response>>
{
	public async Task<IReadOnlyList<Response>> HandleAsync(Query query, CancellationToken ct)
	{
		await authorization.EnsureCanAccessProjectAsync(query.ProjectId, actor, ct);
		
		return await db.Projects
			.Where(p => p.Id == query.ProjectId)
			.SelectMany(p => p.Environments
				.Select(e => new Response(e.Id, e.Name)))
			.ToListAsync(ct);
	}
}