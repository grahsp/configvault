using KeyVault.Application.Abstractions.Identity;
using KeyVault.Domain.Projects;

namespace KeyVault.Infrastructure.Authentication;

public class ScopeCapabilities : IScopeCapabilities
{
	public IEnumerable<ProjectCapability> For(IEnumerable<string> scopes)
	{
		foreach (var scope in scopes)
		{
			switch (scope)
			{
				case "config:read":
					yield return ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Read);
					break;
			}
		}
	}
}