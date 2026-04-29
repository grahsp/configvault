namespace KeyVault.Domain.Projects;

public sealed class Environment
{
	public Guid Id { get; private init; }

	public Project Project { get; private init; } = null!;
	public Guid ProjectId { get; private init; }

	public string Name { get; private set; } = null!;
	public DateTimeOffset CreatedAt { get; private init; }

	private Environment() {}

	private Environment(Guid id, Guid projectId, string name, DateTimeOffset now)
	{
		Id = id;
		ProjectId = projectId;
		Name = name;
		CreatedAt = now;
	}

	internal static Environment Create(Guid projectId, string name, DateTimeOffset now)
	{
		ArgumentException.ThrowIfNullOrWhiteSpace(name);
		
		return new Environment(Guid.NewGuid(), projectId, name, now);
	}
}