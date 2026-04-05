using KeyVault.Application.Authentication;
using KeyVault.Infrastructure.Authentication;
using Microsoft.AspNetCore.Authentication;

namespace KeyVault.Api.DependencyInjection;

public static class ApiModule
{
	public static void AddApiServices(this IServiceCollection services)
	{
		services.AddHttpContextAccessor();
		
		services.AddScoped<UserContextFactory>();
		services.AddScoped<ICurrentUser, CurrentUser>();
		
		services.AddAuthentication("Dev")
			.AddScheme<AuthenticationSchemeOptions, DevAuthenticationHandler>("Dev", null);

		services.AddAuthorization();
	}
}