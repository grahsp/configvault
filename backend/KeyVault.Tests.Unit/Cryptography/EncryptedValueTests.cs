using KeyVault.Domain;

namespace KeyVault.Tests.Unit.Cryptography;

public sealed class EncryptedValueTests
{
	private const byte Version = 7;
	private const byte MinimumPayloadByteStart = 1;
	private const byte NonceByteStart = 10;
	private const byte CiphertextByteStart = 40;
	private const byte TagByteStart = 80;
	private const int CiphertextSize = 5;
	private const int InvalidNonceSize = CryptoTestConstants.NonceSize - 1;
	private const int InvalidTagSize = CryptoTestConstants.TagSize - 1;

	[Fact]
	public void Create_ShouldExposeVersion_FromPayloadLayout()
	{
		var secret = CreateKnownSecret();

		Assert.Equal(Version, secret.Version);
	}

	[Fact]
	public void Create_ShouldExposeNonce_FromPayloadLayout()
	{
		var nonce = KnownNonce();

		var secret = EncryptedValue.Create(Version, nonce, KnownCiphertext(), KnownTag());

		Assert.Equal(nonce, secret.Nonce.ToArray());
	}

	[Fact]
	public void Create_ShouldExposeCiphertext_FromPayloadLayout()
	{
		var ciphertext = KnownCiphertext();

		var secret = EncryptedValue.Create(Version, KnownNonce(), ciphertext, KnownTag());

		Assert.Equal(ciphertext, secret.Ciphertext.ToArray());
	}

	[Fact]
	public void Create_ShouldExposeTag_FromPayloadLayout()
	{
		var tag = KnownTag();

		var secret = EncryptedValue.Create(Version, KnownNonce(), KnownCiphertext(), tag);

		Assert.Equal(tag, secret.Tag.ToArray());
	}

	[Fact]
	public void Create_ShouldConstructPayload_InVersionNonceCiphertextTagOrder()
	{
		var nonce = KnownNonce();
		var ciphertext = KnownCiphertext();
		var tag = KnownTag();

		var secret = EncryptedValue.Create(Version, nonce, ciphertext, tag);

		var expected = new[] { Version }.Concat(nonce).Concat(ciphertext).Concat(tag).ToArray();
		Assert.Equal(expected, secret.Payload.ToArray());
	}

	[Fact]
	public void FromPayload_ShouldRoundtripPayload_FromCreatedSecret()
	{
		var original = CreateKnownSecret();

		var parsed = EncryptedValue.FromPayload(original.Payload.ToArray());

		Assert.Equal(original.Payload.ToArray(), parsed.Payload.ToArray());
		Assert.Equal(original.Version, parsed.Version);
		Assert.Equal(original.Nonce.ToArray(), parsed.Nonce.ToArray());
		Assert.Equal(original.Ciphertext.ToArray(), parsed.Ciphertext.ToArray());
		Assert.Equal(original.Tag.ToArray(), parsed.Tag.ToArray());
	}

	[Fact]
	public void FromPayload_ShouldThrow_WhenPayloadIsNull()
	{
		Assert.Throws<ArgumentNullException>(() => EncryptedValue.FromPayload(null!));
	}

	[Fact]
	public void FromPayload_ShouldThrow_WhenPayloadIsShorterThanMinimumLayout()
	{
		var payload = new byte[CryptoTestConstants.MinimumPayloadSize - 1];

		Assert.Throws<ArgumentException>(() => EncryptedValue.FromPayload(payload));
	}

	[Fact]
	public void FromPayload_ShouldAcceptMinimumLengthPayload_WithEmptyCiphertext()
	{
		var payload = Bytes(CryptoTestConstants.MinimumPayloadSize, MinimumPayloadByteStart);

		var secret = EncryptedValue.FromPayload(payload);

		Assert.Empty(secret.Ciphertext.ToArray());
		Assert.Equal(payload, secret.Payload.ToArray());
	}

	[Fact]
	public void Create_ShouldRejectMalformedNonceLength()
	{
		Assert.Throws<ArgumentException>(() =>
			EncryptedValue.Create(Version, Bytes(InvalidNonceSize, NonceByteStart), KnownCiphertext(), KnownTag()));
	}

	[Fact]
	public void Create_ShouldRejectMalformedTagLength()
	{
		Assert.Throws<ArgumentException>(() =>
			EncryptedValue.Create(Version, KnownNonce(), KnownCiphertext(), Bytes(InvalidTagSize, TagByteStart)));
	}

	private static EncryptedValue CreateKnownSecret()
		=> EncryptedValue.Create(Version, KnownNonce(), KnownCiphertext(), KnownTag());

	private static byte[] KnownNonce()
		=> Bytes(CryptoTestConstants.NonceSize, NonceByteStart);

	private static byte[] KnownCiphertext()
		=> Bytes(CiphertextSize, CiphertextByteStart);

	private static byte[] KnownTag()
		=> Bytes(CryptoTestConstants.TagSize, TagByteStart);

	private static byte[] Bytes(int count, byte start)
		=> Enumerable.Range(0, count).Select(offset => (byte)(start + offset)).ToArray();
}
