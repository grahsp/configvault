using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace KeyVault.Tests.Integration.Hosting;

public sealed record TestHostSettings(
	IReadOnlyList<Action<IServiceCollection>> ServiceOverrides,
	IReadOnlyList<Action<IConfigurationBuilder>> ConfigurationOverrides
);
