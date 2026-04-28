using KeyVault.Api.Authentication;
using Microsoft.AspNetCore.Authorization;

namespace KeyVault.Api.Authorization;

public class UserOnlyHandler : AuthorizationHandler<UserOnlyRequirement>
{
	protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, UserOnlyRequirement requirement)
	{
		if (!context.User.IsMachine())
			context.Succeed(requirement);
		
		return Task.CompletedTask;
	}
}
