using KeyVault.Domain.Projects;

namespace KeyVault.Application.Actors;

public interface IActorResolver
{
	Actor Resolve(IActorContext context, Project project);
	Task<Actor> ResolveAsync(IActorContext context, Guid projectId, CancellationToken ct);
}