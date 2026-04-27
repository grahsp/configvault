using KeyVault.Application.Actors;
using Microsoft.AspNetCore.Authorization;

namespace KeyVault.Api.Authorization;

public class ActiveUserHandler(IActorContext actor) : AuthorizationHandler<ActiveUserRequirement>
{
	protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, ActiveUserRequirement requirement)
	{
		if (actor is IUserContext { IsActive: true })
			context.Succeed(requirement);
		
		return Task.CompletedTask;
	}
}