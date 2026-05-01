using KeyVault.Application.Abstractions.Identity;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.Exceptions;
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
}
