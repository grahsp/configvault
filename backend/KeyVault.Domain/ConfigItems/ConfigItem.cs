using System.Diagnostics.CodeAnalysis;
using KeyVault.Domain.ConfigItems.Exceptions;
using KeyVault.Domain.Identity;
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

	public ConfigValueRevision SetValue(
		Guid environmentId,
		EncryptedValue value,
		ActorId actorId,
		DateTimeOffset now,
		uint expectedRevision)
	{
		ArgumentNullException.ThrowIfNull(value);

		if (TryGetValue(environmentId, out var existing))
		{
			if (existing.Revision != expectedRevision)
				throw new StaleConfigValueRevisionException(expectedRevision, existing.Revision);

			return existing.SetValue(ProjectId, value, actorId, now);
		}

		if (expectedRevision != 0)
			throw new StaleConfigValueRevisionException(expectedRevision, 0);

		var current = new ConfigValue(Id, environmentId, 0, value, actorId, now);
		_values.Add(current);
		return current.SetInitialValue(ProjectId, value, actorId, now);
	}
}
