using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Projects.Queries;

public sealed record GetEnvironmentsQuery(Guid ProjectId) : IQuery<IReadOnlyList<GetEnvironmentsResponse>>;
public sealed record GetEnvironmentsResponse(Guid Id, string EnvironmentName);

public sealed class GetEnvironmentsQueryHandler(IActorContext actor, IReadDbContext db)
	: IQueryHandler<GetEnvironmentsQuery, IReadOnlyList<GetEnvironmentsResponse>>
{
	public async Task<IReadOnlyList<GetEnvironmentsResponse>> HandleAsync(GetEnvironmentsQuery query, CancellationToken ct)
	{
		var userId = actor.RequireUserId();

		return await db.Projects
			.Where(p => p.Id == query.ProjectId)
			.Where(p => p.Members.Any(m => p.Id == query.ProjectId && m.UserId == userId))
			.SelectMany(p => p.Environments)
			.OrderBy(e => e.CreatedAt)
			.Select(e => new GetEnvironmentsResponse(e.Id, e.Name))
			.ToListAsync(ct);
	}
}
