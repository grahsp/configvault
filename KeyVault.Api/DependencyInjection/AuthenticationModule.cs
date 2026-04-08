using KeyVault.Api.Authentication;
using KeyVault.Api.Authorization;
using KeyVault.Application.Authentication;
using KeyVault.Infrastructure.Authentication;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace KeyVault.Api.DependencyInjection;

public static class AuthenticationModule
{
	public static void AddAuthenticationModule(this IServiceCollection services, IConfiguration config, IWebHostEnvironment environment)
	{
		if (environment.IsDevelopment())
		{
			services.AddAuthentication(DevAuthenticationHandler.AuthenticationScheme)
				.AddScheme<AuthenticationSchemeOptions, DevAuthenticationHandler>(
					DevAuthenticationHandler.AuthenticationScheme, null);
		}

		if (environment.IsProduction())
		{
			services.Configure<IdentityProviderOptions>(
				config.GetRequiredSection(IdentityProviderOptions.Section));
		
			services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
				.AddJwtBearer();

			services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
				.Configure<IOptions<IdentityProviderOptions>>((options, idp) =>
				{
					options.RequireHttpsMetadata = true;
					
					options.Authority = idp.Value.Authority;
					options.Audience = idp.Value.Audience;

					Console.WriteLine(idp.Value.Authority);
					Console.WriteLine(idp.Value.Audience);
					Console.WriteLine(idp.Value.Issuer);
					
					options.TokenValidationParameters.ValidateAudience = true;
					options.TokenValidationParameters.ValidAudience = idp.Value.Audience;

					options.TokenValidationParameters.ValidateIssuer = true;
					options.TokenValidationParameters.ValidIssuer = idp.Value.Issuer;
					
					options.TokenValidationParameters.ValidateLifetime = true;
					options.TokenValidationParameters.ClockSkew = TimeSpan.FromMinutes(2);
					
					options.TokenValidationParameters.ValidateIssuerSigningKey = true;
				});
		}

		services.AddAuthorization(options =>
		{
			options.FallbackPolicy = new AuthorizationPolicyBuilder()
				.RequireAuthenticatedUser()
				.AddRequirements(new ActiveUserRequirement())
				.Build();
		});
		
		
		services.AddScoped<IAuthorizationHandler, ActiveUserHandler>();
		
		services.AddScoped<IUserProvisioner, UserProvisioner>();
		services.AddScoped<IUserIdentityResolver, UserIdentityResolver>();
		
		services.AddScoped<IUserContextFactory, UserContextFactory>();
		services.AddScoped<IUserContext, UserContextContext>();
	}
}