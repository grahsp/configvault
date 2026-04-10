namespace KeyVault.Application.Projects.Queries.GetProjects;

public sealed record ProjectListItem(Guid Id, string Name, DateTimeOffset CreatedAt);