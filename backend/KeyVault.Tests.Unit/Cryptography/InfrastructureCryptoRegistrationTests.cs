using KeyVault.Application.Abstractions.Cryptography;
using KeyVault.Infrastructure.Configuration;
using KeyVault.Infrastructure.Cryptography;
using KeyVault.Infrastructure.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

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

	private static IServiceCollection CreateServices(string masterKey)
	{
		var configuration = new ConfigurationBuilder()
			.AddInMemoryCollection(new Dictionary<string, string?>
			{
				[$"{DatabaseOptions.Section}:ConnectionString"] = "Host=localhost;Database=keyvault;Username=test;Password=test",
				[$"{EncryptionOptions.Section}:MasterKey"] = masterKey
			})
			.Build();

		var services = new ServiceCollection();
		services.AddInfrastructureModule(configuration);
		return services;
	}
}
