using Environment = KeyVault.Domain.Projects.Environment;

namespace KeyVault.Domain.ConfigItems;

public sealed class ConfigValue
{
	public Guid ConfigItemId { get; private init; }
	public ConfigItem ConfigItem { get; private init; } = null!;
	
	public Guid EnvironmentId { get; private init; }
	public Environment Environment { get; private init; } = null!;
	
	public string Value { get; private set; } = null!;
	
	public Guid LastModifiedBy { get; private set; }
	public DateTimeOffset LastModifiedAt { get; private set; }
	
	private ConfigValue() {}

	internal ConfigValue(Guid configItemId, Guid environmentId, string value, Guid actorId, DateTimeOffset now)
	{
		ConfigItemId = configItemId;
		EnvironmentId = environmentId;
		Value = value;
		
		LastModifiedBy = actorId;
		LastModifiedAt = now;
	}

	public void SetValue(string value, Guid actorId, DateTimeOffset now)
	{
		Value = value;
		LastModifiedBy = actorId;
		LastModifiedAt = now;
	}
}