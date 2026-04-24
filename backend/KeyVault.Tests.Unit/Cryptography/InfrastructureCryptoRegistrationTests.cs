using KeyVault.Application.Abstractions.Cryptography;
using KeyVault.Infrastructure.Configuration;
using KeyVault.Infrastructure.Cryptography;
using KeyVault.Infrastructure.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Npgsql;

namespace KeyVault.Tests.Unit.Cryptography;

public sealed class InfrastructureCryptoRegistrationTests
{
	[Fact]
	public void AddInfrastructureModule_ShouldResolveEnvelopeEncryptionService_WhenEncryptionIsConfigured()
	{
		var services = CreateServices(Convert.ToBase64String(AesGcmEncryptionTests.TestKey(CryptoTestConstants.MasterKeySeed)));
		using var provider = services.BuildServiceProvider();

		var service = provider.GetRequiredService<IEnvelopeEncryptionService>();
		var wrappedKey = service.GenerateDataKey();
		var encrypted = service.EncryptSecret("secret", wrappedKey);

		Assert.Equal("secret", service.DecryptSecret(encrypted, wrappedKey));
	}

	[Theory]
	[InlineData("")]
	[InlineData("not-base64")]
	public void EncryptionOptions_ShouldFailValidation_WhenMasterKeyIsInvalid(string masterKey)
	{
		var services = CreateServices(masterKey);
		using var provider = services.BuildServiceProvider();

		Assert.Throws<OptionsValidationException>(() =>
			provider.GetRequiredService<IOptions<EncryptionOptions>>().Value);
	}

	[Theory]
	[InlineData(false, false, SslMode.Disable, false)]
	[InlineData(true, true, SslMode.Require, true)]
	public void DatabaseOptions_ShouldBuildExpectedConnectionString(
		bool ssl,
		bool trustServerCertificate,
		SslMode expectedSslMode,
		bool expectedTrustServerCertificate)
	{
		var options = new DatabaseOptions
		{
			Host = "localhost",
			Port = 5432,
			Database = "keyvault",
			Username = "test",
			Password = "secret",
			Ssl = ssl,
			TrustServerCertificate = trustServerCertificate
		};

		var connectionStringBuilder = new NpgsqlConnectionStringBuilder(options.ConnectionString);

		Assert.Equal("localhost", connectionStringBuilder.Host);
		Assert.Equal(5432, connectionStringBuilder.Port);
		Assert.Equal("keyvault", connectionStringBuilder.Database);
		Assert.Equal("test", connectionStringBuilder.Username);
		Assert.Equal("secret", connectionStringBuilder.Password);
		Assert.Equal(expectedSslMode, connectionStringBuilder.SslMode);
		Assert.Equal(expectedTrustServerCertificate.ToString(), connectionStringBuilder["Trust Server Certificate"]?.ToString());
	}

	private static IServiceCollection CreateServices(string masterKey)
	{
		var configuration = new ConfigurationBuilder()
			.AddInMemoryCollection(new Dictionary<string, string?>
			{
				[$"{DatabaseOptions.Section}:Host"] = "localhost",
				[$"{DatabaseOptions.Section}:Port"] = "5432",
				[$"{DatabaseOptions.Section}:Database"] = "keyvault",
				[$"{DatabaseOptions.Section}:Username"] = "test",
				[$"{DatabaseOptions.Section}:Password"] = "test",
				[$"{DatabaseOptions.Section}:Ssl"] = "false",
				[$"{DatabaseOptions.Section}:TrustServerCertificate"] = "false",
				[$"{EncryptionOptions.Section}:MasterKey"] = masterKey
			})
			.Build();

		var services = new ServiceCollection();
		services.AddInfrastructureModule(configuration);
		return services;
	}
}
