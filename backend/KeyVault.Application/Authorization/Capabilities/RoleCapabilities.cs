using KeyVault.Domain.Projects;

namespace KeyVault.Application.Authorization.Capabilities;

public sealed class RoleCapabilities
{
	public IReadOnlySet<ProjectCapability> For(ProjectRole role)
		=> role switch
		{
			ProjectRole.Owner => CapabilitySet.Owner.Values,
			ProjectRole.Admin => CapabilitySet.Admin.Values,
			ProjectRole.Member => CapabilitySet.Member.Values,
			_ => throw new ArgumentOutOfRangeException(nameof(role))
		};
}