using KeyVault.Api.Configuration;
using KeyVault.Api.Authentication;

namespace KeyVault.Api.DependencyInjection;

public static class ApiModule
{
	public static void AddApiModule(
		this IServiceCollection services,
		IConfiguration configuration,
		IWebHostEnvironment environment)
	{
		services.AddOptions<CorsOptions>()
			.Bind(configuration.GetSection(CorsOptions.Section))
			.Validate(options =>
					options.AllowedOrigins.All(origin => !string.IsNullOrWhiteSpace(origin)),
				"Cors allowed origins cannot contain empty values.")
			.Validate(options =>
					options.AllowedOrigins.All(origin => Uri.TryCreate(origin, UriKind.Absolute, out _)),
				"Cors allowed origins must be absolute URLs.")
			.ValidateOnStart();

		var allowedOrigins = configuration
			.GetSection(CorsOptions.Section)
			.Get<CorsOptions>()?
			.AllowedOrigins
			.Where(origin => !string.IsNullOrWhiteSpace(origin))
			.ToArray() ?? [];

		services.AddCors(options =>
		{
			options.AddPolicy(CorsOptions.PolicyName, policy =>
			{
				if (allowedOrigins.Length == 0)
				{
					return;
				}

				policy.WithOrigins(allowedOrigins)
					.AllowAnyHeader()
					.AllowAnyMethod();
			});
		});

		if (environment.IsDevelopment())
		{
			services.AddEndpointsApiExplorer();
			services.AddSwaggerGen(options =>
			{
				options.OperationFilter<DevSubjectHeaderFilter>();
				options.CustomSchemaIds(type => type.FullName);
			});
		}

		services.AddHttpContextAccessor();
	}
}