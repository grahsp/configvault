using KeyVault.Api.Authentication;
using KeyVault.Api.DependencyInjection;
using KeyVault.Application.Authentication;
using KeyVault.Application.DependencyInjection;
using KeyVault.Infrastructure.DependencyInjection;
using Microsoft.AspNetCore.Authentication;

namespace KeyVault.Api;

public class Program
{
	public static void Main(string[] args)
	{
		var builder = WebApplication.CreateBuilder(args);

		builder.Configuration
			.AddJsonFile("appsettings.json")
			.AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", true)
			.AddUserSecrets<Program>(true)
			.AddEnvironmentVariables();
		
		if (builder.Environment.IsDevelopment())
		{
			builder.Services.AddEndpointsApiExplorer();
			builder.Services.AddSwaggerGen(options =>
				options.OperationFilter<DevSubjectHeaderFilter>());
			
			builder.Services.AddAuthentication("Dev")
				.AddScheme<AuthenticationSchemeOptions, DevAuthenticationHandler>("Dev", null);
		}

		if (builder.Environment.IsProduction())
		{
			builder.Services.AddAuthentication("Bearer")
				.AddJwtBearer("Bearer", options =>
				{
					options.Authority = "https://dev-80amfbvnreq8wgr1.us.auth0.com/";
					options.Audience = "https://keyvault.com";
				});
		}
		
		builder.Services.AddAuthorization();
		
		builder.Services.AddApiServices();
		builder.Services.AddApplicationServices();
		builder.Services.AddInfrastructureServices(builder.Configuration);

		var app = builder.Build();

		if (app.Environment.IsDevelopment())
		{
			app.UseSwagger();
			app.UseSwaggerUI();
		}

		app.UseAuthentication();
		app.UseMiddleware<CurrentUserMiddleware>();
		app.UseAuthorization();

		app.UseHttpsRedirection();

		app.MapGet("/me", (ICurrentUser user) => Results.Ok(new
		{
			Id = user.UserId,
			Status = user.Status
		}));

		app.Run();
	}
}