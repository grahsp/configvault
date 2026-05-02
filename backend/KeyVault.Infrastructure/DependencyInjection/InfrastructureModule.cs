using System.Reflection;
using KeyVault.Application.Abstractions.Cryptography;
using KeyVault.Application.Abstractions.Identity;
using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems;
using KeyVault.Application.Invitations;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects;
using KeyVault.Application.Users;
using KeyVault.Infrastructure.Authentication;
using KeyVault.Infrastructure.ConfigItems.Formats;
using KeyVault.Infrastructure.Configuration;
using KeyVault.Infrastructure.Cryptography;
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
		services.AddOptions<ProjectInvitationOptions>()
			.Bind(configuration.GetSection(ProjectInvitationOptions.Section))
			.Validate(x => x.Lifetime > TimeSpan.Zero)
			.ValidateOnStart();
		
		services.AddOptions<DatabaseOptions>()
			.Bind(configuration.GetSection(DatabaseOptions.Section))
			.Validate(option =>
					!string.IsNullOrWhiteSpace(option.Host),
				"Database host must be configured!")
			.Validate(option =>
					option.Port > 0,
				"Database port must be greater than zero!")
			.Validate(option =>
					!string.IsNullOrWhiteSpace(option.Database),
				"Database name must be configured!")
			.Validate(option =>
					!string.IsNullOrWhiteSpace(option.Username),
				"Database username must be configured!")
			.Validate(option =>
					!string.IsNullOrWhiteSpace(option.Password),
				"Database password must be configured!")
			.ValidateOnStart();

		services.AddOptions<EncryptionOptions>()
			.Bind(configuration.GetSection(EncryptionOptions.Section))
			.Validate(option =>
					!string.IsNullOrWhiteSpace(option.MasterKey),
				"Encryption master key must be configured!")
			.Validate(option =>
					IsValidMasterKey(option.MasterKey),
				"Encryption master key must be a base64-encoded 32 byte value!")
			.ValidateOnStart();

		services.AddDbContext<AppDbContext>((sp, options) =>
		{
			var database = sp.GetRequiredService<IOptions<DatabaseOptions>>().Value;
			options.UseNpgsql(database.ConnectionString, pgOptions =>
			{
				pgOptions.EnableRetryOnFailure(
					maxRetryCount: 5,
					maxRetryDelay: TimeSpan.FromSeconds(5),
					errorCodesToAdd: null);
			});
		});

		services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<AppDbContext>());
		services.AddScoped<IReadDbContext>(sp => sp.GetRequiredService<AppDbContext>());
		
		services.AddScoped<IUserRepository, EfUserRepository>();
		services.AddScoped<IProjectRepository, EfProjectRepository>();
		services.AddScoped<IProjectInvitationRepository, EfProjectInvitationRepository>();
		services.AddScoped<IConfigItemRepository, EfConfigItemRepository>();

		services.AddSingleton<IAeadEncryption, AesGcmEncryption>();
		services.AddSingleton<IMasterKeyProvider, ConfigurationMasterKeyProvider>();
		services.AddSingleton<IEnvelopeEncryptionService, EnvelopeEncryptionService>();
		
		services.AddSingleton<ITokenService, TokenService>();
		
		services.AddSingleton<EnvConfigFormat>();
		services.AddSingleton<IConfigFormatResolver, ConfigFormatResolver>();
		services.AddSingleton<IConfigImporter>(sp => sp.GetRequiredService<EnvConfigFormat>());
		services.AddSingleton<IConfigExporter>(sp => sp.GetRequiredService<EnvConfigFormat>());

		services.AddSingleton<TimeProvider>(_ => TimeProvider.System);

		services.RegisterHandlers();
		services.AddScoped<ICommandDispatcher, CommandDispatcher>();
		services.AddScoped<IQueryDispatcher, QueryDispatcher>();

		services.AddSingleton<IScopeCapabilities, ScopeCapabilities>();
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

	private static bool IsValidMasterKey(string? value)
	{
		if (string.IsNullOrWhiteSpace(value))
			return false;

		try
		{
			return Convert.FromBase64String(value).Length == 32;
		}
		catch (FormatException)
		{
			return false;
		}
	}
}
