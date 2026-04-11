namespace KeyVault.Application.Projects.Queries.GetProjects;

public sealed record Response(Guid Id, string Name, DateTimeOffset CreatedAt);