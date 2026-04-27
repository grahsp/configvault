using KeyVault.Application.Abstractions.Identity;
using KeyVault.Domain.Projects;

namespace KeyVault.Infrastructure.Authentication;

public class ScopeCapabilityMapper : IScopeCapabilityMapper
{
	public IEnumerable<ProjectCapability> Map(IEnumerable<string> scopes)
	{
		foreach (var scope in scopes)
		{
			switch (scope)
			{
				case "config:read":
					yield return ProjectCapability.ReadConfig;
					break;
			}
		}
	}
}