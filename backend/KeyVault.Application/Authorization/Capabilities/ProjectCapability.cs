namespace KeyVault.Application.Authorization.Capabilities;

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