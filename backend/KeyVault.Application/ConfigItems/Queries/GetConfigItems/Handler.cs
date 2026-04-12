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
		return await db.ConfigItems
			.Where(x => x.ProjectId == query.ProjectId)
			.Where(x => db.Projects.Any(p =>
				p.Id == query.ProjectId &&
				p.Members
					.Any(m => m.UserId == user.UserId)))
			.Select(x => new ConfigItemSummary(x.Id, x.Key.Value))
			.ToListAsync(ct);
	}
}