using KeyVault.Application.Actors;
using KeyVault.Application.Exceptions;
using KeyVault.Application.Persistence;
using KeyVault.Domain.Projects;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Authorization;

public sealed class ActorAuthorizationService(IReadDbContext db) : IActorAuthorizationService
{
	public bool CanAccessProject(Project project, IActorContext actor)
	{
		return actor.UserId is {} userId && project.IsMember(userId);
	}
	
	public void EnsureCanAccessProject(Project project, IActorContext actor)
	{
		if (!CanAccessProject(project, actor))
			throw new ForbiddenException();
	}

	public async Task<bool> CanAccessProjectAsync(Guid projectId, IActorContext actor, CancellationToken ct)
	{
		if (actor.UserId is not {} userId)
			return false;

		return await db.ProjectMembers
			.AnyAsync(x => x.ProjectId == projectId && x.UserId == userId, ct);
	}
	
	public async Task EnsureCanAccessProjectAsync(Guid projectId, IActorContext actor, CancellationToken ct)
	{
		if (!await CanAccessProjectAsync(projectId, actor, ct))
			throw new ForbiddenException();
	}
}
