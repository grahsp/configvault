using KeyVault.Application.ConfigItems;
using KeyVault.Domain.ConfigItems;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Infrastructure.Persistence.Repositories;

public class EfConfigItemRepository(AppDbContext db) : IConfigItemRepository
{
	public Task<ConfigItem?> GetByIdAsync(Guid id, CancellationToken ct)
		=> db.ConfigItems
			.Include(x => x.Values)
			.SingleOrDefaultAsync(x => x.Id == id, ct);
	
	public Task<ConfigItem?> GetByIdAndProjectAsync(Guid projectId, Guid configItemId, CancellationToken ct)
		=> db.ConfigItems
			.Include(x => x.Values)
			.SingleOrDefaultAsync(x =>
					x.Id == configItemId &&
					x.ProjectId == projectId,
				ct);

	public Task<bool> ExistsAsync(Guid projectId, ConfigKey key, CancellationToken ct)
		=> db.ConfigItems.AnyAsync(x => x.ProjectId == projectId && x.Key == key, ct);

	public void Add(ConfigItem configItem)
	{
		db.ConfigItems.Add(configItem);
	}

	public void Remove(ConfigItem configItem)
	{
		db.ConfigItems.Remove(configItem);
	}
}