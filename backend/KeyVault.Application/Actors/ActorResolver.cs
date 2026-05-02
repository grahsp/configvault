using KeyVault.Application.Abstractions.Identity;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.Exceptions;
using KeyVault.Application.Persistence;
using KeyVault.Domain.Projects;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Actors;

public sealed class ActorResolver(IReadDbContext db, RoleCapabilities roleCapabilities, IScopeCapabilities scopeCapabilities) : IActorResolver
{
	public Actor Resolve(IActorContext context, Project project)
	{
		var capabilities = new HashSet<ProjectCapability>();
		
		if (context is MachineActorContext machine)
		{
			capabilities.UnionWith(scopeCapabilities.For(machine.Scopes));
			return new Actor(machine.Id, capabilities);
		}

		if (context is UserActorContext user)
		{
			var member = project.Members.SingleOrDefault(x => x.UserId == user.UserId);
			
			if (member is not null)
				capabilities.UnionWith(roleCapabilities.For(member.Role));
			
			return new Actor(context.Id, capabilities);
		}

		throw new UnauthorizedException();
	}
	
	public async Task<Actor> ResolveAsync(IActorContext context, Guid projectId, CancellationToken ct)
	{
		var capabilities = new HashSet<ProjectCapability>();
		
		if (context is MachineActorContext machine)
		{
			capabilities.UnionWith(scopeCapabilities.For(machine.Scopes));
			return new Actor(machine.Id, capabilities);
		}

		if (context is UserActorContext user)
		{
			var role = await db.ProjectMembers
				.Where(m => m.ProjectId == projectId && m.UserId == user.UserId)
				.Select(m => m.Role)
				.SingleOrDefaultAsync(ct);
			
			capabilities.UnionWith(roleCapabilities.For(role));
			return new Actor(context.Id, capabilities);
		}

		throw new UnauthorizedException();
	}
}