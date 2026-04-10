namespace KeyVault.Application.Projects.GetProjectList;

public sealed record ProjectListItem(Guid Id, string Name, DateTimeOffset CreatedAt);