using KeyVault.Api.Authentication;
using KeyVault.Api.Configuration;
using KeyVault.Api.DependencyInjection;
using KeyVault.Api.Invitations;
using KeyVault.Api.Middleware;
using KeyVault.Api.Projects;
using KeyVault.Api.Secrets;
using KeyVault.Api.Users;
using KeyVault.Application.DependencyInjection;
using KeyVault.Infrastructure.DependencyInjection;
using KeyVault.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Api;

public class Program
{
	public static void Main(string[] args)
	{
		var builder = WebApplication.CreateBuilder(args);
		
		builder.Services.AddApiModule(builder.Configuration, builder.Environment);
		builder.Services.AddAuthenticationModule(builder.Configuration, builder.Environment);
		
		builder.Services.AddApplicationModule();
		builder.Services.AddInfrastructureModule(builder.Configuration);

		var app = builder.Build();

		if (app.Environment.IsDevelopment())
		{
			app.UseSwagger();
			app.UseSwaggerUI();
		}

		app.UseMiddleware<ExceptionHandlingMiddleware>();

		app.UseHttpsRedirection();
		app.UseCors(CorsOptions.PolicyName);

		app.UseAuthentication();
		app.UseMiddleware<CurrentUserMiddleware>();
		app.UseAuthorization();
		
		using (var scope = app.Services.CreateScope())
		{
			var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
			db.Database.Migrate();
		}

		app.AddUserEndpoints();
		app.AddProjectEndpoints();
		app.AddInvitationEndpoints();
		app.AddSecretEndpoints();

		app.Run();
	}
}
