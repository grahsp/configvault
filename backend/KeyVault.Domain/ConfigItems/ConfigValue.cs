using KeyVault.Domain.Actors;
using Environment = KeyVault.Domain.Projects.Environment;

namespace KeyVault.Domain.ConfigItems;

public sealed class ConfigValue
{
	public Guid ConfigItemId { get; private init; }
	public ConfigItem ConfigItem { get; private init; } = null!;
	
	public Guid EnvironmentId { get; private init; }
	public Environment Environment { get; private init; } = null!;
	
	public EncryptedValue Value { get; private set; } = null!;

	public ActorId LastModifiedBy { get; private set; } = null!;
	public DateTimeOffset LastModifiedAt { get; private set; }
	
	private ConfigValue() {}

	internal ConfigValue(Guid configItemId, Guid environmentId, EncryptedValue value, ActorId actorId, DateTimeOffset now)
	{
		ArgumentNullException.ThrowIfNull(value);

		ConfigItemId = configItemId;
		EnvironmentId = environmentId;
		Value = value;
		
		LastModifiedBy = actorId;
		LastModifiedAt = now;
	}

	public void SetValue(EncryptedValue value, ActorId actorId, DateTimeOffset now)
	{
		ArgumentNullException.ThrowIfNull(value);

		Value = value;
		LastModifiedBy = actorId;
		LastModifiedAt = now;
	}
}
