using KeyVault.Domain.Projects;

namespace KeyVault.Application.Abstractions.Identity;

public interface IScopeCapabilityMapper
{
	IEnumerable<ProjectCapability> Map(IEnumerable<string> scopes);
}