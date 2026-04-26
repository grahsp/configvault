using KeyVault.Domain.ConfigItems;

namespace KeyVault.Application.ConfigItems;

public interface IConfigItemRepository
{
	[Obsolete("Use GetByIdAndProjectAsync instead")]
	Task<ConfigItem?> GetByIdAsync(Guid id, CancellationToken ct);
	
	Task<ConfigItem?> GetByIdAndProjectAsync(Guid projectId, Guid configItemId, CancellationToken ct);
	Task<IReadOnlyList<ConfigItem>> GetByIdsAsync(Guid projectId, IEnumerable<Guid> configItemIds, CancellationToken ct);
	Task<bool> ExistsAsync(Guid projectId, ConfigKey key, CancellationToken ct);
	void Add(ConfigItem configItem);
	void Remove(ConfigItem configItem);
}