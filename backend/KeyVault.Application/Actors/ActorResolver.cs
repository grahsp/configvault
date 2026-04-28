using KeyVault.Application.Abstractions.Identity;
using KeyVault.Application.Exceptions;
using KeyVault.Domain.Identity;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Actors;

public sealed class ActorResolver(RoleCapabilities roleCapabilities, IScopeCapabilities scopeCapabilities) : IActorResolver
{
	public async Task<Actor> ResolveAsync(IActorContext context, Project project, CancellationToken ct)
	{
		var capabilities = new HashSet<ProjectCapability>();
		
		if (context is MachineActorContext machine)
		{
			capabilities.UnionWith(scopeCapabilities.For(machine.Scopes));
			return new Actor(machine.Id, AccessScope.Global, capabilities);
		}

		if (context is UserActorContext user)
		{
			var member = project.Members.SingleOrDefault(x => x.UserId == user.Id);
			
			if (member is not null)
				capabilities.UnionWith(roleCapabilities.For(member.Role));
			
			return new Actor(context.Id, AccessScope.Project, capabilities);
		}

		throw new UnauthorizedException();
	}
}