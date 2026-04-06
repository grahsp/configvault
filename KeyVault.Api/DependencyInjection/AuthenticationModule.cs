using KeyVault.Api.Authentication;
using KeyVault.Application.Authentication;
using KeyVault.Infrastructure.Authentication;
using Microsoft.AspNetCore.Authentication;

namespace KeyVault.Api.DependencyInjection;

public static class AuthenticationModule
{
	public static void AddAuthenticationModule(this IServiceCollection services, IWebHostEnvironment environment)
	{
		if (environment.IsDevelopment())
		{
			services.AddAuthentication("Dev")
				.AddScheme<AuthenticationSchemeOptions, DevAuthenticationHandler>("Dev", null);
		}

		if (environment.IsProduction())
		{
			services.AddAuthentication("Bearer")
				.AddJwtBearer("Bearer", options =>
				{
					options.Authority = "https://dev-80amfbvnreq8wgr1.us.auth0.com/";
					options.Audience = "https://keyvault.com";
				});
		}

		services.AddAuthorization();
		
		services.AddScoped<CurrentUserMiddleware>();
		
		services.AddScoped<IUserProvisioner, UserProvisioner>();
		services.AddScoped<IUserIdentityResolver, UserIdentityResolver>();
		
		services.AddScoped<IUserContextFactory, UserContextFactory>();
		services.AddScoped<ICurrentUser, CurrentUser>();
	}
}
