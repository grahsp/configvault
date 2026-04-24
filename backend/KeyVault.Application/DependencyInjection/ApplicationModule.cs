using Microsoft.Extensions.DependencyInjection;
using KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations;

namespace KeyVault.Application.DependencyInjection;

public static class ApplicationModule
{
	public static void AddApplicationModule(this IServiceCollection services)
	{
		services.AddScoped<IExecutor, Executor>();
		services.AddScoped<IProcessor, Processor>();
	}
}
