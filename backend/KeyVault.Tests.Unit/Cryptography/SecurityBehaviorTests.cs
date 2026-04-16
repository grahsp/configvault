using System.Security.Cryptography;
using System.Text;
using KeyVault.Domain;
using KeyVault.Infrastructure.Cryptography;

namespace KeyVault.Tests.Unit.Cryptography;

public sealed class SecurityBehaviorTests
{
	private readonly AesGcmEncryption _crypto = new AesGcmEncryption();

	[Fact]
	public void Decrypt_ShouldNotReturnCorruptedPlaintext_WhenCiphertextIsTampered()
	{
		var key = AesGcmEncryptionTests.TestKey(CryptoTestConstants.DefaultKeySeed);
		var plaintext = Encoding.UTF8.GetBytes("authenticated plaintext");
		var encrypted = _crypto.Encrypt(plaintext, key);
		var tampered = MutatePayload(encrypted, payload => payload[CryptoTestConstants.CiphertextOffset] ^= CryptoTestConstants.BitFlipMask);

		var exception = Record.Exception(() => _crypto.Decrypt(tampered, key));

		Assert.IsAssignableFrom<CryptographicException>(exception);
	}

	[Fact]
	public void DecryptSecret_ShouldEnforceMasterKeyIsolation()
	{
		var serviceA = EnvelopeEncryptionServiceTests.CreateService(AesGcmEncryptionTests.TestKey(CryptoTestConstants.IsolatedMasterKeySeed));
		var serviceB = EnvelopeEncryptionServiceTests.CreateService(AesGcmEncryptionTests.TestKey(CryptoTestConstants.DifferentIsolatedMasterKeySeed));
		var wrappedKey = serviceA.GenerateDataKey();
		var encrypted = serviceA.EncryptSecret("value", wrappedKey);

		Assert.ThrowsAny<CryptographicException>(() => serviceB.DecryptSecret(encrypted, wrappedKey));
	}

	[Fact]
	public void EncryptSecret_ShouldEncryptWithDataKey_NotDirectlyWithMasterKey()
	{
		var masterKey = AesGcmEncryptionTests.TestKey(CryptoTestConstants.IsolatedMasterKeySeed);
		var service = EnvelopeEncryptionServiceTests.CreateService(masterKey);
		var wrappedKey = service.GenerateDataKey();
		var encrypted = service.EncryptSecret("value", wrappedKey);

		Assert.ThrowsAny<CryptographicException>(() => _crypto.Decrypt(encrypted, masterKey));
	}

	[Fact]
	public void EncryptThenDecrypt_ShouldRoundtripRandomByteArrays()
	{
		var key = AesGcmEncryptionTests.TestKey(CryptoTestConstants.DefaultKeySeed);

		for (var i = 0; i < CryptoTestConstants.RandomRoundtripCount; i++)
		{
			var plaintext = RandomNumberGenerator.GetBytes(i * CryptoTestConstants.RandomByteArraySizeStep);

			var encrypted = _crypto.Encrypt(plaintext, key);
			var decrypted = _crypto.Decrypt(encrypted, key);

			Assert.Equal(plaintext, decrypted);
		}
	}

	[Fact]
	public void EncryptSecretThenDecryptSecret_ShouldRoundtripRandomStrings()
	{
		var service = EnvelopeEncryptionServiceTests.CreateService(AesGcmEncryptionTests.TestKey(CryptoTestConstants.IsolatedMasterKeySeed));
		var wrappedKey = service.GenerateDataKey();

		for (var i = 0; i < CryptoTestConstants.RandomRoundtripCount; i++)
		{
			var secret = Convert.ToBase64String(RandomNumberGenerator.GetBytes(i));

			var encrypted = service.EncryptSecret(secret, wrappedKey);
			var decrypted = service.DecryptSecret(encrypted, wrappedKey);

			Assert.Equal(secret, decrypted);
		}
	}

	private static EncryptedValue MutatePayload(EncryptedValue encrypted, Action<byte[]> mutate)
	{
		var payload = encrypted.Payload.ToArray();
		mutate(payload);
		return EncryptedValue.FromPayload(payload);
	}
}
