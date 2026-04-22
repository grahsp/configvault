using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace KeyVault.Tests.Integration.Hosting;

public sealed class TestHostBuilder
{
	private readonly List<Action<IServiceCollection>> _serviceOverrides = [];
	private readonly List<Action<IConfigurationBuilder>> _configurationOverrides = [];

	public TestHostBuilder UseConnectionString(string connectionString)
	{
		ArgumentException.ThrowIfNullOrWhiteSpace(connectionString);

		_configurationOverrides.Add(builder => builder.AddInMemoryCollection(new Dictionary<string, string?>
		{
			["Database:ConnectionString"] = connectionString
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
}
