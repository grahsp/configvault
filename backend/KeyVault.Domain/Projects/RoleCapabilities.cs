namespace KeyVault.Domain.Projects;

public sealed class CapabilitySet
{
	private readonly HashSet<ProjectCapability> _values;

	public CapabilitySet(IEnumerable<ProjectCapability> values)
		=> _values = [..values];

	public CapabilitySet Extend(IEnumerable<ProjectCapability> additional)
		=> new CapabilitySet(_values.Concat(additional));

	public IReadOnlySet<ProjectCapability> Values => _values;
	
	public static readonly CapabilitySet Member = new CapabilitySet([
		ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Read)
	]);

	public static readonly CapabilitySet Admin =
		Member.Extend([
		]);

	public static readonly CapabilitySet Owner =
		Admin.Extend([
		]);
}

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

public enum ProjectResource
{
	ConfigValue
}

public enum ProjectPermission
{
	Read,
}

public sealed record ProjectCapability
{
	public ProjectResource Resource { get; }
	public ProjectPermission Permission { get; }
	
	private ProjectCapability(ProjectResource resource, ProjectPermission permission)
	{
		Resource = resource;
		Permission = permission;
	}
	
	public static ProjectCapability Create(ProjectResource resource, ProjectPermission permission)
		=> new ProjectCapability(resource, permission);
}

public interface IProjectAction
{
	ProjectCapability RequiredCapability { get; }
}

public sealed record ReadProject : IProjectAction
{
	public ProjectCapability RequiredCapability
		=> ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Read);
}