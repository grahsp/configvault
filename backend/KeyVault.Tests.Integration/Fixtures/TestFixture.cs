using KeyVault.Api.Authentication;
using KeyVault.Infrastructure.Persistence;
using KeyVault.Tests.Integration.Infrastructure;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace KeyVault.Tests.Integration.Fixtures;

public sealed class TestFixture : IAsyncLifetime
{
	private PostgresDatabase _database = null!;

	public Task InitializeAsync()
	{
		_database = new PostgresDatabase();
		return _database.InitializeAsync();
	}

	public TestHost CreateHost(Action<TestHostBuilder>? configure = null)
	{
		return TestHostFactory.Create(builder =>
		{
			builder.UseConnectionString(_database.ConnectionString);
			
			builder.ConfigureServices(services =>
			{
				services.AddAuthentication(opts =>
					{
						opts.DefaultAuthenticateScheme = DevAuthenticationHandler.AuthenticationScheme;
						opts.DefaultChallengeScheme = DevAuthenticationHandler.AuthenticationScheme;
						opts.DefaultScheme = DevAuthenticationHandler.AuthenticationScheme;
					})
					.AddScheme<AuthenticationSchemeOptions, DevAuthenticationHandler>(
						DevAuthenticationHandler.AuthenticationScheme, _ => { });
				
				services.AddAuthorization();
			});

			configure?.Invoke(builder);
		});
	}

	public TestHost CreateDefaultHost(Action<TestHostBuilder>? configure = null) =>
		CreateHost(configure);

	public static async Task ResetAsync(TestHost host)
	{
		await host.WithScopeAsync(async sp =>
		{
			var db = sp.GetRequiredService<AppDbContext>();
			
			await db.Database.EnsureDeletedAsync();
			await db.Database.MigrateAsync();
		});
	}

	public async Task DisposeAsync() => await _database.DisposeAsync();
}
