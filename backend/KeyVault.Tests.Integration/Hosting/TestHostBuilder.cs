using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace KeyVault.Tests.Integration.Hosting;

public sealed class TestHostBuilder
{
	private readonly List<Action<IServiceCollection>> _serviceOverrides = [];
	private readonly List<Action<IConfigurationBuilder>> _configurationOverrides = [];

	public TestHostBuilder UseConnectionString(string connectionString)
	{
		ArgumentException.ThrowIfNullOrWhiteSpace(connectionString);
		var connectionStringBuilder = new NpgsqlConnectionStringBuilder(connectionString);

		_configurationOverrides.Add(builder => builder.AddInMemoryCollection(new Dictionary<string, string?>
		{
			["Database:Host"] = connectionStringBuilder.Host,
			["Database:Port"] = connectionStringBuilder.Port.ToString(),
			["Database:Database"] = connectionStringBuilder.Database,
			["Database:Username"] = connectionStringBuilder.Username,
			["Database:Password"] = connectionStringBuilder.Password,
			["Database:Ssl"] = RequiresSsl(connectionStringBuilder.SslMode).ToString(),
			["Database:TrustServerCertificate"] = connectionStringBuilder.TryGetValue("Trust Server Certificate", out var trustServerCertificate)
				? trustServerCertificate?.ToString()
				: bool.FalseString
		}));

		return this;
	}

	public TestHostBuilder ConfigureServices(Action<IServiceCollection> configure)
	{
		_serviceOverrides.Add(configure);
		return this;
	}

	public TestHostBuilder ConfigureConfiguration(Action<IConfigurationBuilder> configure)
	{
		_configurationOverrides.Add(configure);
		return this;
	}

	public TestHostBuilder UseConfiguration(IDictionary<string, string?> values)
	{
		_configurationOverrides.Add(builder => builder.AddInMemoryCollection(values));
		return this;
	}

	public TestHostSettings Build() =>
		new TestHostSettings(_serviceOverrides, _configurationOverrides);

	private static bool RequiresSsl(SslMode sslMode) =>
		sslMode is SslMode.Require or SslMode.VerifyCA or SslMode.VerifyFull;
}
