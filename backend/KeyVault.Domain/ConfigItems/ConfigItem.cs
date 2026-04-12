namespace KeyVault.Domain.ConfigItems;

public sealed class ConfigItem
{
	public Guid Id { get; private init; }
	public Guid ProjectId { get; private init; }

	public ConfigKey Key { get; private set; } = null!;
	
	public DateTimeOffset CreatedAt { get; private init; }
	
	private ConfigItem() {}

	private ConfigItem(Guid id, Guid projectId, ConfigKey key, DateTimeOffset now)
	{
		Id = id;
		ProjectId = projectId;
		Key = key;
		CreatedAt = now;
	}

	public static ConfigItem Create(Guid projectId, ConfigKey key, DateTimeOffset now)
	{
		return new ConfigItem(Guid.NewGuid(), projectId, key, now);
	}
	
	public void SetKey(ConfigKey key) => Key = key;
}