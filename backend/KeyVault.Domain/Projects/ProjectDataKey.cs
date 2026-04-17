namespace KeyVault.Domain.Projects;

public sealed class ProjectDataKey
{
	public Guid Id { get; private init; }
	public Guid ProjectId { get; private init; }
	public Project Project { get; private init; } = null!;
	public EncryptedValue Value { get; private init; } = null!;
	public DateTimeOffset CreatedAt { get; private init; }

	private ProjectDataKey() {}

	private ProjectDataKey(Guid id, Guid projectId, EncryptedValue value, DateTimeOffset now)
	{
		ArgumentNullException.ThrowIfNull(value);

		Id = id;
		ProjectId = projectId;
		Value = value;
		CreatedAt = now;
	}

	internal static ProjectDataKey Create(Guid projectId, EncryptedValue value, DateTimeOffset now)
		=> new(Guid.NewGuid(), projectId, value, now);
}
