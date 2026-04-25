using KeyVault.Application.Authentication;
using KeyVault.Application.Exceptions;
using KeyVault.Application.Persistence;
using KeyVault.Domain.Projects;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Authorization;

public sealed class ActorAuthorizationService(IReadDbContext db) : IActorAuthorizationService
{
	public bool CanAccessProject(Project project, IActorContext actor)
	{
		return actor switch
		{
			IUserContext user => project.IsMember(user.UserId),
			_ => false
		};
	}
	
	public void EnsureCanAccessProject(Project project, IActorContext actor)
	{
		if (!CanAccessProject(project, actor))
			throw new ForbiddenException();
	}

	public async Task<bool> CanAccessProjectAsync(Guid projectId, IActorContext actor, CancellationToken ct)
	{
		return actor switch
		{
			IUserContext user => await db.Projects
				.Where(p => p.Id == projectId)
				.AnyAsync(p => p.Members
						.Any(m => m.UserId == user.UserId),
					ct),
			_ => false
		};
	}
	
	public async Task EnsureCanAccessProjectAsync(Guid projectId, IActorContext actor, CancellationToken ct)
	{
		if (!await CanAccessProjectAsync(projectId, actor, ct))
			throw new ForbiddenException();
	}
}