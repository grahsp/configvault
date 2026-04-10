using KeyVault.Api.Authentication;

namespace KeyVault.Api.DependencyInjection;

public static class ApiModule
{
	public static void AddApiModule(this IServiceCollection services, IWebHostEnvironment environment)
	{
		if (environment.IsDevelopment())
		{
			services.AddEndpointsApiExplorer();
			services.AddSwaggerGen(options =>
				options.OperationFilter<DevSubjectHeaderFilter>());
		}

		services.AddHttpContextAccessor();
	}
}