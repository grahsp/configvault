using System.Security.Cryptography;
using System.Text;
using KeyVault.Domain;
using KeyVault.Infrastructure.Cryptography;

namespace KeyVault.Tests.Unit.Cryptography;

public sealed class AesGcmEncryptionTests
{
	private readonly AesGcmEncryption _sut = new AesGcmEncryption();

	[Fact]
	public void EncryptThenDecrypt_ShouldReturnOriginalPlaintext()
	{
		var key = TestKey(CryptoTestConstants.DefaultKeySeed);
		var plaintext = RandomNumberGenerator.GetBytes(CryptoTestConstants.RandomPlaintextSize);

		var encrypted = _sut.Encrypt(plaintext, key);
		var decrypted = _sut.Decrypt(encrypted, key);

		Assert.Equal(plaintext, decrypted);
	}

	[Fact]
	public void Encrypt_ShouldProduceDifferentPayloads_ForSamePlaintextAndKey()
	{
		var key = TestKey(CryptoTestConstants.DefaultKeySeed);
		var plaintext = Encoding.UTF8.GetBytes("secret");

		var first = _sut.Encrypt(plaintext, key);
		var second = _sut.Encrypt(plaintext, key);

		Assert.NotEqual(first.Payload.ToArray(), second.Payload.ToArray());
	}

	[Fact]
	public void Encrypt_ShouldUseDifferentNonce_ForEachOperation()
	{
		var key = TestKey(CryptoTestConstants.DefaultKeySeed);
		var plaintext = Encoding.UTF8.GetBytes("secret");

		var first = _sut.Encrypt(plaintext, key);
		var second = _sut.Encrypt(plaintext, key);

		Assert.NotEqual(first.Nonce.ToArray(), second.Nonce.ToArray());
	}

	[Fact]
	public void Decrypt_ShouldThrow_WhenCiphertextIsTampered()
	{
		var key = TestKey(CryptoTestConstants.DefaultKeySeed);
		var encrypted = _sut.Encrypt(Encoding.UTF8.GetBytes("secret"), key);
		var tampered = MutatePayload(encrypted, payload => payload[CryptoTestConstants.CiphertextOffset] ^= CryptoTestConstants.BitFlipMask);

		Assert.ThrowsAny<CryptographicException>(() => _sut.Decrypt(tampered, key));
	}

	[Fact]
	public void Decrypt_ShouldThrow_WhenNonceIsTampered()
	{
		var key = TestKey(CryptoTestConstants.DefaultKeySeed);
		var encrypted = _sut.Encrypt(Encoding.UTF8.GetBytes("secret"), key);
		var tampered = MutatePayload(encrypted, payload => payload[CryptoTestConstants.NonceOffset] ^= CryptoTestConstants.BitFlipMask);

		Assert.ThrowsAny<CryptographicException>(() => _sut.Decrypt(tampered, key));
	}

	[Fact]
	public void Decrypt_ShouldThrow_WhenTagIsTampered()
	{
		var key = TestKey(CryptoTestConstants.DefaultKeySeed);
		var encrypted = _sut.Encrypt(Encoding.UTF8.GetBytes("secret"), key);
		var tampered = MutatePayload(encrypted, payload => payload[^1] ^= CryptoTestConstants.BitFlipMask);

		Assert.ThrowsAny<CryptographicException>(() => _sut.Decrypt(tampered, key));
	}

	[Fact]
	public void Decrypt_ShouldThrow_WhenKeyIsWrong()
	{
		var encrypted = _sut.Encrypt(Encoding.UTF8.GetBytes("secret"), TestKey(CryptoTestConstants.DefaultKeySeed));

		Assert.ThrowsAny<CryptographicException>(() => _sut.Decrypt(encrypted, TestKey(CryptoTestConstants.OtherMasterKeySeed)));
	}

	[Fact]
	public void EncryptThenDecrypt_ShouldRoundtripEmptyPlaintext()
	{
		var key = TestKey(CryptoTestConstants.DefaultKeySeed);
		var plaintext = Array.Empty<byte>();

		var encrypted = _sut.Encrypt(plaintext, key);
		var decrypted = _sut.Decrypt(encrypted, key);

		Assert.Empty(decrypted);
	}

	[Fact]
	public void EncryptThenDecrypt_ShouldRoundtripLargePlaintext()
	{
		var key = TestKey(CryptoTestConstants.DefaultKeySeed);
		var plaintext = RandomNumberGenerator.GetBytes(CryptoTestConstants.LargePlaintextSize);

		var encrypted = _sut.Encrypt(plaintext, key);
		var decrypted = _sut.Decrypt(encrypted, key);

		Assert.Equal(plaintext, decrypted);
	}

	[Fact]
	public void Decrypt_ShouldThrow_WhenPayloadVersionIsUnsupported()
	{
		var key = TestKey(CryptoTestConstants.DefaultKeySeed);
		var encrypted = _sut.Encrypt(Encoding.UTF8.GetBytes("secret"), key);
		var unsupportedVersion = MutatePayload(encrypted, payload => payload[CryptoTestConstants.VersionOffset] = CryptoTestConstants.UnsupportedVersion);

		Assert.Throws<InvalidOperationException>(() => _sut.Decrypt(unsupportedVersion, key));
	}

	[Theory]
	[InlineData(CryptoTestConstants.EmptyKeySize)]
	[InlineData(CryptoTestConstants.Aes128KeySize)]
	[InlineData(CryptoTestConstants.ShortAes256KeySize)]
	[InlineData(CryptoTestConstants.LongAes256KeySize)]
	public void Encrypt_ShouldThrow_WhenKeyLengthIsInvalid(int length)
	{
		var key = new byte[length];

		Assert.Throws<ArgumentException>(() => _sut.Encrypt(Array.Empty<byte>(), key));
	}

	private static EncryptedValue MutatePayload(EncryptedValue encrypted, Action<byte[]> mutate)
	{
		var payload = encrypted.Payload.ToArray();
		mutate(payload);
		return EncryptedValue.FromPayload(payload);
	}

	internal static byte[] TestKey(byte seed)
		=> Enumerable.Range(0, CryptoTestConstants.KeySize).Select(offset => (byte)(seed + offset)).ToArray();
}
