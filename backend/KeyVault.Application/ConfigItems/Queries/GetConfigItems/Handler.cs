using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.ConfigItems.Exceptions;
using KeyVault.Application.ConfigItems.Views;
using KeyVault.Application.Persistence;
using KeyVault.Domain.Identity;
using KeyVault.Domain.Projects;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.ConfigItems.Queries.GetConfigItems;

public class Handler(IActorContext actor, IReadDbContext db)
	: IQueryHandler<Query, IReadOnlyList<ConfigItemSummary>>
{
	public async Task<IReadOnlyList<ConfigItemSummary>> HandleAsync(Query query, CancellationToken ct)
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
				i.Values.Any(value => value.EnvironmentId == environmentId)
			))
			.ToListAsync(ct);
	}
}
