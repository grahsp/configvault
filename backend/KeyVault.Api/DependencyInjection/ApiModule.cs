using System.Text.Json;
using System.Text.Json.Serialization;
using KeyVault.Api.Authentication;
using KeyVault.Api.Configuration;

namespace KeyVault.Api.DependencyInjection;

public static class ApiModule
{
	public static void AddApiModule(
		this IServiceCollection services,
		IConfiguration configuration,
		IWebHostEnvironment environment)
	{
		services.ConfigureHttpJsonOptions(options =>
		{
			options.SerializerOptions.Converters
				.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
		});
		
		services.AddOptions<CorsOptions>()
			.Bind(configuration.GetSection(CorsOptions.Section))
			.Validate(
				options => CorsOriginParser.TryParse(options.AllowedOrigins, out _),
				"Cors allowed origins must be a comma-separated list of absolute URLs without empty values.")
			.ValidateOnStart();

		var allowedOrigins = CorsOriginParser.Parse(
			configuration.GetSection(CorsOptions.Section).Get<CorsOptions>()?.AllowedOrigins);

		services.AddCors(options =>
		{
			options.AddPolicy(CorsOptions.PolicyName, policy =>
			{
				Console.WriteLine("CORS: " + string.Join(',', allowedOrigins));
				
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
