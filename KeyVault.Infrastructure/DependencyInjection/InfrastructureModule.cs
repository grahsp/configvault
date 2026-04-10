using System.Reflection;
using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Persistence;
using KeyVault.Application.Users;
using KeyVault.Infrastructure.Configuration;
using KeyVault.Infrastructure.Dispatchers;
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
		services.AddScoped<IReadDbContext>(sp => sp.GetRequiredService<AppDbContext>());
		
		services.AddScoped<IUserRepository, EfUserRepository>();

		services.AddSingleton<TimeProvider>(_ => TimeProvider.System);

		services.RegisterHandlers();
		services.AddScoped<ICommandDispatcher, CommandDispatcher>();
		services.AddScoped<IQueryDispatcher, QueryDispatcher>();
	}

	private static void RegisterHandlers(this IServiceCollection services)
	{
		var handlers = GetHandlerTypes(typeof(ICommandHandler<,>).Assembly);

		foreach (var handler in handlers)
		{
			RegisterHandler(handler);
			RegisterWrapper(handler);
		}

		IEnumerable<Type> GetHandlerTypes(Assembly assembly) =>
			assembly.GetTypes()
				.Where(t => t is { IsAbstract: false, IsInterface: false })
				.Where(t => t.GetInterfaces()
					.Any(IsHandler));

		bool IsHandler(Type i) =>
			i.IsGenericType &&
			(i.GetGenericTypeDefinition() == typeof(ICommandHandler<,>) ||
			 i.GetGenericTypeDefinition() == typeof(IQueryHandler<,>));

		void RegisterHandler(Type handler)
		{
			var interfaces = handler.GetInterfaces()
				.Where(IsHandler);

			foreach (var @interface in interfaces)
			{
				services.AddScoped(@interface, handler);
			}
		}
		
		void RegisterWrapper(Type handler)
		{
			var interfaces = handler.GetInterfaces()
				.Where(IsHandler);

			foreach (var @interface in interfaces)
			{
				var args = @interface.GetGenericArguments();

				var wrapperType =
					@interface.GetGenericTypeDefinition() == typeof(ICommandHandler<,>)
						? typeof(CommandHandlerWrapper<,>).MakeGenericType(args[0], args[1])
						: typeof(QueryHandlerWrapper<,>).MakeGenericType(args[0], args[1]);

				var wrapperInterface =
					@interface.GetGenericTypeDefinition() == typeof(ICommandHandler<,>)
						? typeof(ICommandHandlerWrapper)
						: typeof(IQueryHandlerWrapper);

				services.AddScoped(wrapperInterface, wrapperType);
			}
		}
	}
}