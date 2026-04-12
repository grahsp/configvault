using KeyVault.Domain.ConfigItems;

namespace KeyVault.Application.ConfigItems;

public interface IConfigItemRepository
{
	Task<ConfigItem?> GetByIdAsync(Guid id, CancellationToken ct);
	Task<bool> ExistsAsync(Guid projectId, ConfigKey key, CancellationToken ct);
	void Add(ConfigItem configItem);
	void Remove(ConfigItem configItem);
}