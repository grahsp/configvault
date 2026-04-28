using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Abstractions.Identity;

public interface IScopeCapabilities
{
	IEnumerable<ProjectCapability> For(IEnumerable<string> scopes);
}