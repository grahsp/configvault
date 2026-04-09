using KeyVault.Application.Authentication;
using KeyVault.Application.Persistence;
using KeyVault.Application.Users;
using KeyVault.Infrastructure.Authentication;
using KeyVault.Infrastructure.Configuration;
using KeyVault.Infrastructure.Persistence;
using KeyVault.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace KeyVault.Infrastructure.DependencyInjection;

public static class InfrastructureModule
{
	public static void AddInfrastructureModule(this IServiceCollection services, IConfiguration configuration)
	{
		services.AddOptions<DatabaseOptions>()
			.Bind(configuration.GetSection(DatabaseOptions.Section))
			.Validate(option =>
					!string.IsNullOrWhiteSpace(option.ConnectionString),
				"Database connection string must be configured!")
			.ValidateOnStart();

		services.AddDbContext<AppDbContext>((sp, options) =>
		{
			var database = sp.GetRequiredService<IOptions<DatabaseOptions>>().Value;
			options.UseNpgsql(database.ConnectionString);
		});

		services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<AppDbContext>());
		services.AddScoped<IUserRepository, EfUserRepository>();

		services.AddSingleton<TimeProvider>(_ => TimeProvider.System);

		services.RegisterHandlers();
		services.AddScoped<ICommandDispatcher, CommandDispatcher>();
	}

	private static void RegisterHandlers(this IServiceCollection services)
	{
		var assembly = typeof(ICommandHandler<>).Assembly;
		
		var handlers = assembly.GetTypes()
			.Where(t => !t.IsAbstract && !t.IsInterface);

		foreach (var handler in handlers)
		{
			var interfaces = handler.GetInterfaces()
				.Where(i => i.IsGenericType &&
				             (i.GetGenericTypeDefinition() == typeof(ICommandHandler<>) ||
				             i.GetGenericTypeDefinition() == typeof(ICommandHandler<,>)));

			foreach (var @interface in interfaces)
			{
				services.AddScoped(@interface, handler);
			}
		}
	}
}