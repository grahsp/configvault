using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.Authorization;
using KeyVault.Application.Exceptions;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Projects.Queries.GetMembers;

public class Handler(
	IUserContext actor,
	IActorAuthorizationService authorization,
	IReadDbContext db)
	: IQueryHandler<Query, IReadOnlyList<Response>>
{
	public async Task<IReadOnlyList<Response>> HandleAsync(Query query, CancellationToken ct)
	{
		await authorization.EnsureCanAccessProjectAsync(query.ProjectId, actor, ct);
		
		return await db.ProjectMembers
			.Where(x => x.ProjectId == query.ProjectId)
			.Join(db.Users,
				x => x.UserId,
				u => u.Id,
				(x, u) => new Response(
					u.Id.Value,
					u.DisplayName,
					x.Role,
					u.Id == actor.Id))
			.ToListAsync(ct);
	}
}