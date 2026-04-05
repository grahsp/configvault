using KeyVault.Api.DependencyInjection;
using KeyVault.Application;
using KeyVault.Application.Authentication;
using KeyVault.Application.DependencyInjection;
using KeyVault.Infrastructure.DependencyInjection;

namespace KeyVault.Api;

public class Program
{
	public static void Main(string[] args)
	{
		var builder = WebApplication.CreateBuilder(args);

		if (builder.Environment.IsDevelopment())
		{
			builder.Services.AddEndpointsApiExplorer();
			builder.Services.AddSwaggerGen(options =>
			{
				options.OperationFilter<DevSubjectHeaderFilter>();
			});
		}
		
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
		app.UseAuthorization();

		app.UseHttpsRedirection();

		app.Run();
	}
}