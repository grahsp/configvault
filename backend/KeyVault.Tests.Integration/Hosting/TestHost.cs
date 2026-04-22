using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Time.Testing;
using KeyVault.Api;

namespace KeyVault.Tests.Integration.Hosting;

public sealed class TestHost(WebApplicationFactory<Program> factory) : ITestHost
{
	private IServiceProvider Services => factory.Services;

	public FakeTimeProvider Time => Resolve<FakeTimeProvider>();

	public HttpClient CreateClient() => factory.CreateClient();

	public TOptions GetOptions<TOptions>() where TOptions : class =>
		Services.GetRequiredService<IOptions<TOptions>>().Value;

	public async Task WithScopeAsync(Func<IServiceProvider, Task> action)
	{
		await using var scope = Services.CreateAsyncScope();
		await action(scope.ServiceProvider);
	}

	public async Task<T> WithScopeAsync<T>(Func<IServiceProvider, Task<T>> action)
	{
		await using var scope = Services.CreateAsyncScope();
		return await action(scope.ServiceProvider);
	}

	public T Resolve<T>() where T : notnull => Services.GetRequiredService<T>();

	public Task<T> ResolveAsync<T>() where T : notnull =>
		WithScopeAsync(services => Task.FromResult(services.GetRequiredService<T>()));

	public ValueTask DisposeAsync() => factory.DisposeAsync();
}
