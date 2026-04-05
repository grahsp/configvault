using KeyVault.Application.Users;
using Microsoft.Extensions.DependencyInjection;

namespace KeyVault.Application.DependencyInjection;

public static class ApplicationModule
{
	public static void AddApplicationServices(this IServiceCollection services)
	{
		services.AddScoped<UserProvisioner>();
	}
}