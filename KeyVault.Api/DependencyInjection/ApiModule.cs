using KeyVault.Api.Authentication;
using KeyVault.Application.Authentication;

namespace KeyVault.Api.DependencyInjection;

public static class ApiModule
{
	public static void AddApiServices(this IServiceCollection services)
	{
		services.AddHttpContextAccessor();
		
		services.AddScoped<IUserContextFactory, UserContextFactory>();
		services.AddScoped<ICurrentUser, CurrentUser>();
	}
}