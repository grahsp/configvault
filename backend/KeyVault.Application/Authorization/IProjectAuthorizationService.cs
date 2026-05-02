using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Authorization;

public interface IProjectAuthorizationService
{
	bool CanAccess(ProjectCapability capability, Project project);
	Task<bool> CanAccessAsync(ProjectCapability capability, Guid projectId, CancellationToken ct);
	void EnsureCanAccess(ProjectCapability capability, Project project);
	Task EnsureCanAccessAsync(ProjectCapability capability, Guid projectId, CancellationToken ct);
}
