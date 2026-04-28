using KeyVault.Application.Abstractions.Identity;
using KeyVault.Application.Authorization.Capabilities;
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
				case "config:write":
					yield return ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Write);
					break;
				case "config:manage":
					yield return ProjectCapability.Create(ProjectResource.ConfigItem, ProjectPermission.Manage);
					break;
				case "project:members:manage":
					yield return ProjectCapability.Create(ProjectResource.ProjectMember, ProjectPermission.Manage);
					break;
				case "project:environments:manage":
					yield return ProjectCapability.Create(ProjectResource.Environment, ProjectPermission.Manage);
					break;
				case "project:delete":
					yield return ProjectCapability.Create(ProjectResource.Project, ProjectPermission.Delete);
					break;
			}
		}
	}
}
