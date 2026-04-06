using KeyVault.Api.Authentication;

namespace KeyVault.Api.DependencyInjection;

public static class ApiModule
{
	public static void AddApiServices(this IServiceCollection services)
	{
		services.AddHttpContextAccessor();
	}
}
