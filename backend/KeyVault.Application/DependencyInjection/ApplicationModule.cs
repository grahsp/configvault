using KeyVault.Application.Actors;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.ConfigItems.BatchExecution;
using KeyVault.Application.ConfigItems.BatchExecution.Planning;
using KeyVault.Domain.Projects;
using Microsoft.Extensions.DependencyInjection;

namespace KeyVault.Application.DependencyInjection;

public static class ApplicationModule
{
	public static void AddApplicationModule(this IServiceCollection services)
	{
		services.AddScoped<IConfigItemMutationExecutor, ConfigItemMutationExecutor>();
		services.AddScoped<IConfigItemBatchPlanner, ConfigItemBatchPlanner>();

		services.AddScoped<IActorResolver, ActorResolver>();
		services.AddScoped<IProjectAuthorizationService, ProjectAuthorizationService>();
		
		services.AddSingleton<RoleCapabilities>();
		
		services.AddScoped<IActorAuthorizationService, ActorAuthorizationService>();
	}
}
