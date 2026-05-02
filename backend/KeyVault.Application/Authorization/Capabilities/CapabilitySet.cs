namespace KeyVault.Application.Authorization.Capabilities;

public sealed class CapabilitySet
{
	private readonly HashSet<ProjectCapability> _values;

	public CapabilitySet(IEnumerable<ProjectCapability> values)
		=> _values = [..values];

	public CapabilitySet Extend(IEnumerable<ProjectCapability> additional)
		=> new CapabilitySet(_values.Concat(additional));

	public IReadOnlySet<ProjectCapability> Values => _values;
	
	public static readonly CapabilitySet Member = new CapabilitySet([
		ProjectCapability.Create(ProjectResource.ConfigItem, ProjectPermission.Write),
		ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Read),
		ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Write)
	]);

	public static readonly CapabilitySet Admin =
		Member.Extend([
			ProjectCapability.Create(ProjectResource.ConfigItem, ProjectPermission.Manage),
			ProjectCapability.Create(ProjectResource.ProjectMember, ProjectPermission.Manage),
			ProjectCapability.Create(ProjectResource.Environment, ProjectPermission.Manage),
		]);

	public static readonly CapabilitySet Owner =
		Admin.Extend([
			ProjectCapability.Create(ProjectResource.Project, ProjectPermission.Delete),
			ProjectCapability.Create(ProjectResource.ProjectMember, ProjectPermission.Write),
		]);
}
