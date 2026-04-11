using KeyVault.Domain.Projects;

namespace KeyVault.Application.Projects.Queries.GetProject;

public sealed record Response(
	Guid Id,
	string Name,
	ProjectRole Role,
	DateTimeOffset CreatedAt
);