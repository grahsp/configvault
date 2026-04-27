using KeyVault.Domain.Identity;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Actors;

public interface IActorResolver
{
	Task<Actor> ResolveAsync(IActorContext context, Project project, CancellationToken ct);
}