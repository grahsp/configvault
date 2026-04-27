using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Authorization;
using KeyVault.Application.ConfigItems.Views;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.ConfigItems.Queries.GetConfigItems;

public class Handler(IActorContext actor, IActorAuthorizationService authorization, IReadDbContext db)
	: IQueryHandler<Query, IReadOnlyList<ConfigItemSummary>>
{
	public async Task<IReadOnlyList<ConfigItemSummary>> HandleAsync(Query query, CancellationToken ct)
	{
		if (!await authorization.CanAccessProjectAsync(query.ProjectId, actor, ct))
			return [];

		var environmentId = await db.Environments
			.Where(e => e.ProjectId == query.ProjectId && e.Name == query.EnvironmentName)
			.Select(e => (Guid?)e.Id)
			.FirstOrDefaultAsync(ct);

		if (environmentId is null)
			return [];

		return await db.ConfigItems
			.Where(x => x.ProjectId == query.ProjectId)
			.Select(x => new ConfigItemSummary(
				x.Id,
				x.Key.Value,
				x.Values.Any(v => v.EnvironmentId == environmentId)
			))
			.ToListAsync(ct);
	}
}