using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.ConfigItems.Views;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.ConfigItems.Queries.GetConfigItems;

public class Handler(
	IUserContext user,
	IReadDbContext db)
	: IQueryHandler<Query, IReadOnlyList<ConfigItemSummary>>
{
	public async Task<IReadOnlyList<ConfigItemSummary>> HandleAsync(Query query, CancellationToken ct)
	{
		var hasAccess = await db.Projects
			.Where(p => p.Id == query.ProjectId)
			.AnyAsync(p => p.Members.Any(m => m.UserId == user.UserId), ct);

		if (!hasAccess)
			return [];

		return await db.ConfigItems
			.Where(x => x.ProjectId == query.ProjectId)
			.Select(x => new ConfigItemSummary(
				x.Id,
				x.Key.Value,
				x.Values.Any(v => v.Environment.Name == query.EnvironmentName)
			))
			.ToListAsync(ct);
	}
}