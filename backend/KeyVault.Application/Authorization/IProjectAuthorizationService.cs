using KeyVault.Domain.Projects;

namespace KeyVault.Application.Authorization;

public interface IProjectAuthorizationService
{
	Task<bool> CanAccessAsync(IProjectAction action, Project project, CancellationToken ct);
	Task EnsureCanAccessAsync(IProjectAction action, Project project, CancellationToken ct);
}