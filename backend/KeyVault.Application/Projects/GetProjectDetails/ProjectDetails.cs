namespace KeyVault.Application.Projects.GetProjectDetails;

public sealed record ProjectDetails(Guid Id, string Name, DateTimeOffset CreatedAt);