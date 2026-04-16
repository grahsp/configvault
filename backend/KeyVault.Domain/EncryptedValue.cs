namespace KeyVault.Domain;

public sealed class EncryptedValue
{
	// FORMAT: [version] [nonce] [ciphertext] [tag]
	public ReadOnlyMemory<byte> Payload { get; }

	private const int VersionSize = 1;
	private const int NonceSize = 12;
	private const int TagSize = 16;

	private const int VersionOffset = 0;
	private const int NonceOffset = VersionOffset + VersionSize;
	private const int CiphertextOffset = NonceOffset + NonceSize;
	private const int MinPayloadSize = VersionSize + NonceSize + TagSize;

	private EncryptedValue(byte[] payload)
	{
		Validate(payload);
		Payload = payload;
	}

	public static EncryptedValue FromPayload(byte[] payload)
		=> new EncryptedValue(payload);

	public static EncryptedValue Create(
		byte version,
		ReadOnlySpan<byte> nonce,
		ReadOnlySpan<byte> ciphertext,
		ReadOnlySpan<byte> tag)
	{
		if (nonce.Length != NonceSize)
			throw new ArgumentException($"Nonce must be {NonceSize} bytes.", nameof(nonce));

		if (tag.Length != TagSize)
			throw new ArgumentException($"Tag must be {TagSize} bytes.", nameof(tag));

		var payload = new byte[VersionSize + nonce.Length + ciphertext.Length + tag.Length];
		var span = payload.AsSpan();

		span[VersionOffset] = version;
		nonce.CopyTo(span.Slice(NonceOffset, NonceSize));
		ciphertext.CopyTo(span.Slice(CiphertextOffset, ciphertext.Length));
		tag.CopyTo(span.Slice(payload.Length - TagSize, TagSize));

		return new EncryptedValue(payload);
	}

	public byte Version => Payload.Span[VersionOffset];

	public ReadOnlySpan<byte> Nonce =>
		Payload.Span.Slice(NonceOffset, NonceSize);

	public ReadOnlySpan<byte> Ciphertext
	{
		get
		{
			var span = Payload.Span;
			var ciphertextLength = span.Length - CiphertextOffset - TagSize;
			return span.Slice(CiphertextOffset, ciphertextLength);
		}
	}

	public ReadOnlySpan<byte> Tag
	{
		get
		{
			var span = Payload.Span;
			return span.Slice(span.Length - TagSize, TagSize);
		}
	}

	private static void Validate(byte[] payload)
	{
		ArgumentNullException.ThrowIfNull(payload);

		if (payload.Length < MinPayloadSize)
			throw new ArgumentException("Invalid encrypted payload.", nameof(payload));
	}
}