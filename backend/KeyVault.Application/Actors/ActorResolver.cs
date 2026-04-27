using KeyVault.Application.Abstractions.Identity;
using KeyVault.Application.Exceptions;
using KeyVault.Application.Persistence;
using KeyVault.Domain.Identity;
using KeyVault.Domain.Projects;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Actors;

public interface IActorResolver
{
	Task<Actor> ResolveAsync(IActorContext context, Project project, CancellationToken ct);
}

public sealed class ActorResolver(IReadDbContext db, IScopeCapabilityMapper mapper) : IActorResolver
{
	public async Task<Actor> ResolveAsync(IActorContext context, Project project, CancellationToken ct)
	{
		var capabilities = new HashSet<ProjectCapability>();
		
		if (context is MachineActorContext machine)
		{
			capabilities.UnionWith(mapper.Map(machine.Scopes));
			return new Actor(machine.Id, capabilities);
		}

		if (context is UserActorContext user)
		{
			var role = await db.ProjectMembers
				.Where(x => x.ProjectId == project.Id && x.UserId == user.Id)
				.Select(x => x.Role)
				.SingleOrDefaultAsync(ct);

			capabilities.UnionWith(ProjectRoleCapabilities.Get(role));
			return new Actor(context.Id, capabilities);
		}

		throw new UnauthorizedException();
	}
}