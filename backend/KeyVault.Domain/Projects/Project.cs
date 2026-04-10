namespace KeyVault.Domain.Projects;

public sealed class Project
{
	public Guid Id { get; private init; }
	public Guid OwnerId { get; private set; }

	public string Name { get; private set; } = null!;
	
	public DateTimeOffset CreatedAt { get; private init; }

	private Project() {}

	public Project(Guid id, Guid ownerId, string name, DateTimeOffset now)
	{
		Id = id;
		OwnerId = ownerId;
		Name = name;

		CreatedAt = now;
	}

	public static Project Create(Guid ownerId, string name, DateTimeOffset now)
	{
		ArgumentException.ThrowIfNullOrWhiteSpace(name);
		
		return new Project(Guid.NewGuid(), ownerId, name, now);
	}
}