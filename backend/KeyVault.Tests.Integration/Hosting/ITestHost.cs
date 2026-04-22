namespace KeyVault.Tests.Integration.Hosting;

public interface ITestHost : IAsyncDisposable
{
	HttpClient CreateClient();
	Task WithScopeAsync(Func<IServiceProvider, Task> action);
	Task<T> WithScopeAsync<T>(Func<IServiceProvider, Task<T>> action);
}
