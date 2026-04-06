using KeyVault.Api.Authentication;
using KeyVault.Api.DependencyInjection;
using KeyVault.Application.Authentication;
using KeyVault.Application.DependencyInjection;
using KeyVault.Infrastructure.DependencyInjection;

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
		
		builder.Services.AddApiModule(builder.Environment);
		builder.Services.AddAuthenticationModule(builder.Environment);
		
		builder.Services.AddApplicationModule();
		builder.Services.AddInfrastructureModule(builder.Configuration);

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