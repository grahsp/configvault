using KeyVault.Domain.Identity;
using Environment = KeyVault.Domain.Projects.Environment;

namespace KeyVault.Domain.ConfigItems;

public sealed class ConfigValue
{
	public Guid ConfigItemId { get; private init; }
	public ConfigItem ConfigItem { get; private init; } = null!;
	
	public Guid EnvironmentId { get; private init; }
	public Environment Environment { get; private init; } = null!;
	
	public uint Revision { get; private set; }
	public EncryptedValue Value { get; private set; } = null!;

	public ActorId LastModifiedBy { get; private set; } = null!;
	public DateTimeOffset LastModifiedAt { get; private set; }
	
	private ConfigValue() {}

	internal ConfigValue(
		Guid configItemId,
		Guid environmentId,
		uint revision,
		EncryptedValue value,
		ActorId actorId,
		DateTimeOffset now)
	{
		ArgumentNullException.ThrowIfNull(value);

		ConfigItemId = configItemId;
		EnvironmentId = environmentId;
		Revision = revision;
		Value = value;
		
		LastModifiedBy = actorId;
		LastModifiedAt = now;
	}

	public ConfigValueRevision SetInitialValue(
		Guid projectId,
		EncryptedValue value,
		ActorId actorId,
		DateTimeOffset now)
	{
		ArgumentNullException.ThrowIfNull(value);

		Revision = 1;
		Value = value;
		LastModifiedBy = actorId;
		LastModifiedAt = now;

		return new ConfigValueRevision(projectId, ConfigItemId, EnvironmentId, Revision, value, actorId, now);
	}

	public ConfigValueRevision SetValue(
		Guid projectId,
		EncryptedValue value,
		ActorId actorId,
		DateTimeOffset now)
	{
		ArgumentNullException.ThrowIfNull(value);

		Revision++;
		Value = value;
		LastModifiedBy = actorId;
		LastModifiedAt = now;

		return new ConfigValueRevision(projectId, ConfigItemId, EnvironmentId, Revision, value, actorId, now);
	}
}
