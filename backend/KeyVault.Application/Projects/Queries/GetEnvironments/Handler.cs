using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Projects.Queries.GetEnvironments;

public class Handler(IUserContext user, IReadDbContext db) : IQueryHandler<Query, IReadOnlyList<Response>>
{
	public async Task<IReadOnlyList<Response>> HandleAsync(Query query, CancellationToken ct)
	{
		return await db.Projects
			.Where(p => p.Id == query.ProjectId)
			.Where(p => p.Members.Any(m => m.UserId == user.UserId))
			.SelectMany(p => p.Environments.Select(e => new Response(e.Id, e.Name)))
			.ToListAsync(ct);
	}
}