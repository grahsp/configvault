using KeyVault.Application.Actors;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.Exceptions;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Authorization;

public sealed class ProjectAuthorizationService(
	IActorContext context,
	IActorResolver resolver)
	: IProjectAuthorizationService
{
	public bool CanAccess(ProjectCapability capability, Project project)
	{
		var actor = resolver.Resolve(context, project);
		return actor.Has(capability);
	}
	
	public async Task<bool> CanAccessAsync(ProjectCapability capability, Guid projectId, CancellationToken ct)
	{
		var actor = await resolver.ResolveAsync(context, projectId, ct);
		return actor.Has(capability);
	}
	
	public void EnsureCanAccess(ProjectCapability capability, Project project)
	{
		if (!CanAccess(capability, project))
			throw new ForbiddenException();
	}
	
	public async Task EnsureCanAccessAsync(ProjectCapability capability, Guid projectId, CancellationToken ct)
	{
		if (!await CanAccessAsync(capability, projectId, ct))
			throw new ForbiddenException();
	}
}
