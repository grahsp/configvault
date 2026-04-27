using KeyVault.Application.Actors;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Authorization;

public interface IActorAuthorizationService
{
	bool CanAccessProject(Project project, IActorContext actor);
	void EnsureCanAccessProject(Project project, IActorContext actor);
	Task<bool> CanAccessProjectAsync(Guid projectId, IActorContext actor, CancellationToken ct);
	Task EnsureCanAccessProjectAsync(Guid projectId, IActorContext actor, CancellationToken ct);
}