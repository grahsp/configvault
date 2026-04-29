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
	public async Task<bool> CanAccessAsync(ProjectCapability capability, Project project, CancellationToken ct)
	{
		var actor = await resolver.ResolveAsync(context, project, ct);

		return await CanAccessInternalAsync(
			capability,
			actor,
			_ => Task.FromResult(context.UserId is {} userId && project.IsMember(userId)),
			ct);
	}

	public async Task EnsureCanAccessAsync(ProjectCapability capability, Project project, CancellationToken ct)
	{
		if (!await CanAccessAsync(capability, project, ct))
			throw new ForbiddenException();
	}

	private async Task<bool> CanAccessInternalAsync(ProjectCapability capability, Actor actor, Func<CancellationToken, Task<bool>> hasProjectAccess, CancellationToken ct)
	{
		if (!actor.Has(capability))
			return false;

		return await hasProjectAccess(ct);
	}
}
