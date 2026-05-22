using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Persistence;
using KeyVault.Domain.Projects;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Projects.Queries;

public sealed record GetMembersQuery(Guid ProjectId) : IQuery<IReadOnlyList<GetMembersResponse>>;
public sealed record GetMembersResponse(
	string UserId,
	string? DisplayName,
	ProjectRole Role,
	bool IsCurrentUser);

public sealed class GetMembersQueryHandler(IActorContext actor, IReadDbContext db)
	: IQueryHandler<GetMembersQuery, IReadOnlyList<GetMembersResponse>>
{
	public async Task<IReadOnlyList<GetMembersResponse>> HandleAsync(GetMembersQuery query, CancellationToken ct)
	{
		var userId = actor.RequireUserId();

		return await db.ProjectMembers
			.Where(m => m.ProjectId == query.ProjectId)
			.Where(m => db.ProjectMembers.Any(u => u.ProjectId == m.ProjectId && u.UserId == userId))
			.OrderBy(m => m.Role)
			.Join(db.Users,
				u => u.UserId,
				u => u.Id,
				(m, u) => new GetMembersResponse(
					u.Id.ToString(),
					u.DisplayName,
					m.Role,
					u.Id == userId))
			.ToListAsync(ct);
	}
}
