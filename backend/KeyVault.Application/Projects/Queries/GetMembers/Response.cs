using KeyVault.Domain.Projects;

namespace KeyVault.Application.Projects.Queries.GetMembers;

public sealed record Response(
	Guid UserId,
	string? DisplayName,
	ProjectRole Role,
	bool IsCurrentUser
);