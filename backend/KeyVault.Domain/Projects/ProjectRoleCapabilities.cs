namespace KeyVault.Domain.Projects;

public static class ProjectRoleCapabilities
{
	public static IReadOnlySet<ProjectCapability> Get(ProjectRole role)
		=> role switch
		{
			ProjectRole.Owner => Enum.GetValues<ProjectCapability>().ToHashSet(),
			ProjectRole.Admin =>
			[
				ProjectCapability.ReadConfig,
				ProjectCapability.WriteConfig,
				ProjectCapability.DeleteConfig,
				ProjectCapability.ManageMembers,
				ProjectCapability.ManageEnvironments,
			],
			ProjectRole.Member =>
			[
				ProjectCapability.ReadConfig,
			],
			_ => throw new ArgumentOutOfRangeException(nameof(role))
		};
}