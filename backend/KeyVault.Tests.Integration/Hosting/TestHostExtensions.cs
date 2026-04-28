using System.Net.Http.Headers;
using Microsoft.Extensions.DependencyInjection;

namespace KeyVault.Tests.Integration.Hosting;

public static class TestHostExtensions
{
	public static HttpClient CreateAuthenticatedClient(this TestHost host, string subject)
	{
		var client = host.CreateClient();
		client.DefaultRequestHeaders.Add("X-Dev-Sub", subject);
		return client;
	}

	public static HttpClient CreateMachineClient(this TestHost host, string clientId = "machine-client")
	{
		var client = host.CreateAuthenticatedClient(clientId);
		client.DefaultRequestHeaders.Add("X-Dev-GrantType", "client-credentials");
		return client;
	}

	public static HttpClient CreateJsonClient(this TestHost host, string? subject = null)
	{
		var client = subject is null
			? host.CreateClient()
			: host.CreateAuthenticatedClient(subject);

		client.DefaultRequestHeaders.Accept.Add(
			new MediaTypeWithQualityHeaderValue("application/json"));

		return client;
	}

	public static Task WithServiceAsync<TService>(
		this ITestHost host,
		Func<TService, Task> action)
		where TService : notnull =>
		host.WithScopeAsync(services => action(services.GetRequiredService<TService>()));

	public static Task<TResult> WithServiceAsync<TService, TResult>(
		this ITestHost host,
		Func<TService, Task<TResult>> action)
		where TService : notnull =>
		host.WithScopeAsync(services => action(services.GetRequiredService<TService>()));
}
