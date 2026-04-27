using KeyVault.Application.Abstractions.Identity;
using KeyVault.Application.Exceptions;
using KeyVault.Domain.Identity;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Actors;

public sealed class ActorResolver(IScopeCapabilityMapper mapper) : IActorResolver
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
			var member = project.Members.SingleOrDefault(x => x.UserId == user.Id);
			
			if (member is not null)
				capabilities.UnionWith(ProjectRoleCapabilities.Get(member.Role));
			
			return new Actor(context.Id, capabilities);
		}

		throw new UnauthorizedException();
	}
}