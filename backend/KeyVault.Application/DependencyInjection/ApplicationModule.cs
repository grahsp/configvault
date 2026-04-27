using KeyVault.Application.Actors;
using KeyVault.Application.Authorization;
using KeyVault.Application.ConfigItems.BatchExecution;
using KeyVault.Application.ConfigItems.BatchExecution.Planning;
using Microsoft.Extensions.DependencyInjection;

namespace KeyVault.Application.DependencyInjection;

public static class ApplicationModule
{
	public static void AddApplicationModule(this IServiceCollection services)
	{
		services.AddScoped<IConfigItemMutationExecutor, ConfigItemMutationExecutor>();
		services.AddScoped<IConfigItemBatchPlanner, ConfigItemBatchPlanner>();

		services.AddScoped<IActorResolver, ActorResolver>();
		services.AddScoped<IActorAuthorizationService, ActorAuthorizationService>();
		services.AddScoped<IConfigItemOperationAuthorizer, ConfigItemOperationAuthorizer>();
	}
}
