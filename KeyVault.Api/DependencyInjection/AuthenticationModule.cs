using KeyVault.Api.Authentication;
using KeyVault.Application.Authentication;
using KeyVault.Infrastructure.Authentication;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace KeyVault.Api.DependencyInjection;

public static class AuthenticationModule
{
	public static void AddAuthenticationModule(this IServiceCollection services, IWebHostEnvironment environment)
	{
		if (environment.IsDevelopment())
		{
			services.AddAuthentication(DevAuthenticationHandler.AuthenticationScheme)
				.AddScheme<AuthenticationSchemeOptions, DevAuthenticationHandler>(
					DevAuthenticationHandler.AuthenticationScheme, null);
		}

		if (environment.IsProduction())
		{
			services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
				.AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
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
