using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.ConfigItems.Views;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.ConfigItems.Queries;

public sealed record GetConfigItemsQuery(Guid ProjectId, string EnvironmentName) : IQuery<IReadOnlyList<ConfigItemSummary>>;

public sealed class GetConfigItemsQueryHandler(IActorContext actor, IReadDbContext db)
	: IQueryHandler<GetConfigItemsQuery, IReadOnlyList<ConfigItemSummary>>
{
	public async Task<IReadOnlyList<ConfigItemSummary>> HandleAsync(GetConfigItemsQuery query, CancellationToken ct)
	{
		var userId = actor.RequireUserId();

		var environmentId = await db.Environments
			.Where(e => e.ProjectId == query.ProjectId && e.Name == query.EnvironmentName)
			.Select(e => (Guid?)e.Id)
			.SingleOrDefaultAsync(ct);

		if (environmentId is null)
			return [];

		return await db.ConfigItems
			.Where(p => p.ProjectId == query.ProjectId)
			.Where(p => db.ProjectMembers.Any(m => m.ProjectId == p.ProjectId && m.UserId == userId))
			.OrderBy(i => i.Key)
			.Select(i => new ConfigItemSummary(
				i.Id,
				i.Key.Value,
				i.Values.Any(value => value.EnvironmentId == environmentId),
				i.Values
					.Where(value => value.EnvironmentId == environmentId)
					.Select(value => value.Revision)
					.SingleOrDefault()))
			.ToListAsync(ct);
	}
}
