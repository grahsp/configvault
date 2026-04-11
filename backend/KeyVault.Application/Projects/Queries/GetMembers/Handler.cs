using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.Exceptions;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Projects.Queries.GetMembers;

public class Handler(IUserContext user, IReadDbContext db)
	: IQueryHandler<Query, IReadOnlyList<Response>>
{
	public async Task<IReadOnlyList<Response>> HandleAsync(Query query, CancellationToken ct)
	{
		var isMember = await db.ProjectMembers
			.AnyAsync(x =>
				x.ProjectId == query.ProjectId &&
				x.UserId == user.UserId, ct);

		if (!isMember)
			throw new ForbiddenException("Caller does not have access");
		
		return await db.ProjectMembers
			.Where(x => x.ProjectId == query.ProjectId)
			.Join(db.Users,
				x => x.UserId,
				u => u.Id,
				(x, u) => new Response(
					u.Id,
					u.DisplayName,
					x.Role,
					u.Id == user.UserId))
			.ToListAsync(ct);
	}
}