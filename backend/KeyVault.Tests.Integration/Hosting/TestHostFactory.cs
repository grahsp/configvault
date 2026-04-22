using KeyVault.Api;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Time.Testing;

namespace KeyVault.Tests.Integration.Hosting;

public sealed class TestHostFactory(TestHostSettings settings) : WebApplicationFactory<Program>
{
	protected override void ConfigureWebHost(IWebHostBuilder builder)
	{
		builder.UseEnvironment("Test");

		builder.ConfigureAppConfiguration((_, configuration) =>
		{
			foreach (var configure in settings.ConfigurationOverrides)
				configure(configuration);
		});

		builder.ConfigureServices(services =>
		{
			var time = new FakeTimeProvider();
			services.RemoveAll<TimeProvider>();
			services.AddSingleton<TimeProvider>(time);
			services.AddSingleton(time);

			foreach (var configure in settings.ServiceOverrides)
				configure(services);
		});
	}

	public static TestHost Create(Action<TestHostBuilder>? configure = null)
	{
		var builder = new TestHostBuilder();
		configure?.Invoke(builder);

		var settings = builder.Build();
		var factory = new TestHostFactory(settings);
		
		return new TestHost(factory);
	}
}
