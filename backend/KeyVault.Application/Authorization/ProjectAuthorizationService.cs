using KeyVault.Application.Actors;
using KeyVault.Application.Exceptions;
using KeyVault.Domain.Identity;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Authorization;

public sealed class ProjectAuthorizationService(
	IActorContext context,
	IActorResolver resolver)
	: IProjectAuthorizationService
{
	public async Task<bool> CanAccessAsync(IProjectAction action, Project project, CancellationToken ct)
	{
		var actor = await resolver.ResolveAsync(context, project, ct);

		return await CanAccessInternalAsync(
			action,
			actor,
			_ => Task.FromResult(project.IsMember(actor.Id)),
			ct);
	}

	public async Task EnsureCanAccessAsync(IProjectAction action, Project project, CancellationToken ct)
	{
		if (!await CanAccessAsync(action, project, ct))
			throw new ForbiddenException();
	}

	private async Task<bool> CanAccessInternalAsync(IProjectAction action, Actor actor, Func<CancellationToken, Task<bool>> isMember, CancellationToken ct)
	{
		var required = action.RequiredCapability;

		if (!actor.Has(required))
			return false;

		if (actor.Scope is AccessScope.Global)
			return true;

		return await isMember(ct);
	}
}