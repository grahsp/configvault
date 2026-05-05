using KeyVault.Domain.Identity;

namespace KeyVault.Domain.ConfigItems;

public sealed class ConfigValueRevision
{
	public Guid ProjectId { get; private init; }
	public Guid ConfigItemId { get; private init; }
	public Guid EnvironmentId { get; private init; }
	public uint Revision { get; private init; }

	public EncryptedValue Value { get; private init; } = null!;
	public ActorId ModifiedBy { get; private init; } = null!;
	public DateTimeOffset ModifiedAt { get; private init; }

	private ConfigValueRevision() { }

	internal ConfigValueRevision(
		Guid projectId,
		Guid configItemId,
		Guid environmentId,
		uint revision,
		EncryptedValue value,
		ActorId modifiedBy,
		DateTimeOffset modifiedAt)
	{
		ArgumentNullException.ThrowIfNull(value);

		ProjectId = projectId;
		ConfigItemId = configItemId;
		EnvironmentId = environmentId;
		Revision = revision;
		Value = value;
		ModifiedBy = modifiedBy;
		ModifiedAt = modifiedAt;
	}
}
