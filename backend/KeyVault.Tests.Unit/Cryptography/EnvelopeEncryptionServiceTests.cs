using System.Security.Cryptography;
using KeyVault.Domain;
using KeyVault.Infrastructure.Cryptography;

namespace KeyVault.Tests.Unit.Cryptography;

public sealed class EnvelopeEncryptionServiceTests
{
	private const int LongSecretRepeatCount = 512;

	[Fact]
	public void GenerateDataKey_ShouldReturnEncryptedPayload()
	{
		var sut = CreateService(AesGcmEncryptionTests.TestKey(CryptoTestConstants.MasterKeySeed));

		var wrappedKey = sut.GenerateDataKey();

		Assert.NotEmpty(wrappedKey.Payload.ToArray());
		Assert.Equal(CryptoTestConstants.CurrentVersion, wrappedKey.Version);
		Assert.Equal(CryptoTestConstants.NonceSize, wrappedKey.Nonce.Length);
		Assert.Equal(CryptoTestConstants.DataKeySize, wrappedKey.Ciphertext.Length);
		Assert.Equal(CryptoTestConstants.TagSize, wrappedKey.Tag.Length);
	}

	[Fact]
	public void GenerateDataKey_ShouldGenerateRandomWrappedKeys()
	{
		var sut = CreateService(AesGcmEncryptionTests.TestKey(CryptoTestConstants.MasterKeySeed));

		var first = sut.GenerateDataKey();
		var second = sut.GenerateDataKey();

		Assert.NotEqual(first.Payload.ToArray(), second.Payload.ToArray());
	}

	[Fact]
	public void EncryptSecretThenDecryptSecret_ShouldReturnOriginalValue()
	{
		var sut = CreateService(AesGcmEncryptionTests.TestKey(CryptoTestConstants.MasterKeySeed));
		var wrappedKey = sut.GenerateDataKey();

		var encrypted = sut.EncryptSecret("value", wrappedKey);
		var decrypted = sut.DecryptSecret(encrypted, wrappedKey);

		Assert.Equal("value", decrypted);
	}

	[Fact]
	public void DecryptSecret_ShouldThrow_WhenUsingDifferentWrappedDataKey()
	{
		var sut = CreateService(AesGcmEncryptionTests.TestKey(CryptoTestConstants.MasterKeySeed));
		var keyA = sut.GenerateDataKey();
		var keyB = sut.GenerateDataKey();
		var secret = sut.EncryptSecret("value", keyA);

		Assert.ThrowsAny<CryptographicException>(() => sut.DecryptSecret(secret, keyB));
	}

	[Fact]
	public void DecryptSecret_ShouldThrow_WhenEncryptedSecretCiphertextIsTampered()
	{
		var sut = CreateService(AesGcmEncryptionTests.TestKey(CryptoTestConstants.MasterKeySeed));
		var wrappedKey = sut.GenerateDataKey();
		var secret = sut.EncryptSecret("value", wrappedKey);
		var tampered = MutatePayload(secret, payload => payload[CryptoTestConstants.CiphertextOffset] ^= CryptoTestConstants.BitFlipMask);

		Assert.ThrowsAny<CryptographicException>(() => sut.DecryptSecret(tampered, wrappedKey));
	}

	[Fact]
	public void DecryptSecret_ShouldThrow_WhenWrappedDataKeyIsTampered()
	{
		var sut = CreateService(AesGcmEncryptionTests.TestKey(CryptoTestConstants.MasterKeySeed));
		var wrappedKey = sut.GenerateDataKey();
		var secret = sut.EncryptSecret("value", wrappedKey);
		var tamperedWrappedKey = MutatePayload(wrappedKey, payload => payload[^1] ^= CryptoTestConstants.BitFlipMask);

		Assert.ThrowsAny<CryptographicException>(() => sut.DecryptSecret(secret, tamperedWrappedKey));
	}

	[Fact]
	public void EncryptSecretThenDecryptSecret_ShouldRoundtripUnicodeSecrets()
	{
		var sut = CreateService(AesGcmEncryptionTests.TestKey(CryptoTestConstants.MasterKeySeed));
		var wrappedKey = sut.GenerateDataKey();
		var secret = "秘密🔐password";

		var encrypted = sut.EncryptSecret(secret, wrappedKey);
		var decrypted = sut.DecryptSecret(encrypted, wrappedKey);

		Assert.Equal(secret, decrypted);
	}

	[Fact]
	public void EncryptSecretThenDecryptSecret_ShouldRoundtripVeryLongSecrets()
	{
		var sut = CreateService(AesGcmEncryptionTests.TestKey(CryptoTestConstants.MasterKeySeed));
		var wrappedKey = sut.GenerateDataKey();
		var secret = string.Concat(Enumerable.Repeat("long-secret-value:", LongSecretRepeatCount));

		var encrypted = sut.EncryptSecret(secret, wrappedKey);
		var decrypted = sut.DecryptSecret(encrypted, wrappedKey);

		Assert.Equal(secret, decrypted);
	}

	[Fact]
	public void EncryptSecret_ShouldProduceDifferentPayloads_ForSameSecretAndWrappedKey()
	{
		var sut = CreateService(AesGcmEncryptionTests.TestKey(CryptoTestConstants.MasterKeySeed));
		var wrappedKey = sut.GenerateDataKey();

		var first = sut.EncryptSecret("value", wrappedKey);
		var second = sut.EncryptSecret("value", wrappedKey);

		Assert.NotEqual(first.Payload.ToArray(), second.Payload.ToArray());
		Assert.NotEqual(first.Nonce.ToArray(), second.Nonce.ToArray());
	}

	[Fact]
	public void DecryptSecret_ShouldThrow_WhenServiceUsesDifferentMasterKeyProvider()
	{
		var firstService = CreateService(AesGcmEncryptionTests.TestKey(CryptoTestConstants.MasterKeySeed));
		var secondService = CreateService(AesGcmEncryptionTests.TestKey(CryptoTestConstants.OtherMasterKeySeed));
		var wrappedKey = firstService.GenerateDataKey();
		var secret = firstService.EncryptSecret("value", wrappedKey);

		Assert.ThrowsAny<CryptographicException>(() => secondService.DecryptSecret(secret, wrappedKey));
	}

	internal static EnvelopeEncryptionService CreateService(byte[] masterKey)
		=> new(new AesGcmEncryption(), new FixedMasterKeyProvider(masterKey));

	private static EncryptedValue MutatePayload(EncryptedValue encrypted, Action<byte[]> mutate)
	{
		var payload = encrypted.Payload.ToArray();
		mutate(payload);
		return EncryptedValue.FromPayload(payload);
	}

	private sealed class FixedMasterKeyProvider(byte[] key) : IMasterKeyProvider
	{
		public ReadOnlySpan<byte> GetKey() => key;
	}
}
