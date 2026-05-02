using KeyVault.Domain.Projects;

namespace KeyVault.Application.Authorization.Capabilities;

public sealed class RoleCapabilities
{
	public IReadOnlySet<ProjectCapability> For(ProjectRole role)
		=> role switch
		{
			ProjectRole.Member => CapabilitySet.Member.Values,
			ProjectRole.Admin => CapabilitySet.Admin.Values,
			ProjectRole.Owner => CapabilitySet.Owner.Values,
			_ => throw new ArgumentOutOfRangeException(nameof(role))
		};
}