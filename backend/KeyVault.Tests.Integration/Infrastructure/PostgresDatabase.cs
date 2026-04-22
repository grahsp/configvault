using Testcontainers.PostgreSql;

namespace KeyVault.Tests.Integration.Infrastructure;

public sealed class PostgresDatabase : IAsyncDisposable
{
	private readonly PostgreSqlContainer _container = new PostgreSqlBuilder("postgres:17-alpine")
		.WithDatabase("keyvault_tests")
		.WithUsername("postgres")
		.WithPassword("postgres")
		.Build();

	public string ConnectionString => _container.GetConnectionString();

	public Task InitializeAsync() => _container.StartAsync();

	public ValueTask DisposeAsync() => _container.DisposeAsync();
}
