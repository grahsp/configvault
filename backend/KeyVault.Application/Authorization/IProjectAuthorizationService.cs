using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Authorization;

public interface IProjectAuthorizationService
{
	Task<bool> CanAccessAsync(ProjectCapability capability, Project project, CancellationToken ct);
	Task EnsureCanAccessAsync(ProjectCapability capability, Project project, CancellationToken ct);
}
