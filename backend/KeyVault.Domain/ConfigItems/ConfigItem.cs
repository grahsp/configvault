using System.Diagnostics.CodeAnalysis;
using KeyVault.Domain.Projects;

namespace KeyVault.Domain.ConfigItems;

public sealed class ConfigItem
{
	public Guid Id { get; private init; }
	public Guid ProjectId { get; private init; }
	public Project Project { get; private init; } = null!;

	public ConfigKey Key { get; private set; } = null!;
	
	private readonly List<ConfigValue> _values = [];
	public IReadOnlyList<ConfigValue> Values => _values;
	
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

	public bool TryGetValue(Guid environmentId, [NotNullWhen(true)] out ConfigValue? value)
	{
		value = _values.SingleOrDefault(v => v.EnvironmentId == environmentId);
		return value != null;
	}

	public void SetValue(Guid environmentId, EncryptedValue value, Guid actorId, DateTimeOffset now)
	{
		ArgumentNullException.ThrowIfNull(value);

		if (TryGetValue(environmentId, out var existing))
		{
			existing.SetValue(value, actorId, now);
			return;
		}
		
		_values.Add(new ConfigValue(Id, environmentId, value, actorId, now));
	}
}
