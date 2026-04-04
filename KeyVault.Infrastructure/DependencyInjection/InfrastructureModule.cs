using KeyVault.Infrastructure.Configuration;
using KeyVault.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace KeyVault.Infrastructure.DependencyInjection;

public static class InfrastructureModule
{
	public static void AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
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
	}
}