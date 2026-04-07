using KeyVault.Application.Authentication;
using Microsoft.AspNetCore.Authorization;

namespace KeyVault.Api.Authorization;

public class ActiveUserHandler(ICurrentUser user) : AuthorizationHandler<ActiveUserRequirement>
{
	protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, ActiveUserRequirement requirement)
	{
		if (user is { IsAuthenticated: true, IsActive: true })
			context.Succeed(requirement);
		
		return Task.CompletedTask;
	}
}