using KeyVault.Application.Abstractions.Identity;
using KeyVault.Application.Authorization.Capabilities;

namespace KeyVault.Infrastructure.Authentication;

public class ScopeCapabilities : IScopeCapabilities
{
	public IEnumerable<ProjectCapability> For(IEnumerable<string> scopes)
	{
		foreach (var scope in scopes)
		{
			switch (scope)
			{
				case "secret:read":
					yield return ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Read);
					break;
			}
		}
	}
}
