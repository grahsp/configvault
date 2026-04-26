using KeyVault.Domain.Projects;

namespace KeyVault.Application.Projects.Queries.GetMembers;

public sealed record Response(
	string UserId,
	string? DisplayName,
	ProjectRole Role,
	bool IsCurrentUser
);