using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Users.ActivateUser;
using Microsoft.Extensions.DependencyInjection;

namespace KeyVault.Application.DependencyInjection;

public static class ApplicationModule
{
	public static void AddApplicationModule(this IServiceCollection services)
	{
		services.AddScoped<ICommandHandler<ActivateUserCommand>, ActivateUserCommandHandler>();
	}
}