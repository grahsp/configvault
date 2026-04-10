namespace KeyVault.Application.Projects.Queries.GetProject;

public sealed record ProjectDetails(Guid Id, string Name, DateTimeOffset CreatedAt);