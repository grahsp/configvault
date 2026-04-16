using System.Security.Cryptography;
using KeyVault.Application.Abstractions.Cryptography;
using KeyVault.Domain;

namespace KeyVault.Infrastructure.Cryptography;

public class AesGcmEncryption : IAeadEncryption
{
	private const byte CurrentVersion = 1;
	private const int NonceSize = 12;
	private const int TagSize = 16;
	
	public EncryptedValue Encrypt(ReadOnlySpan<byte> plainText, ReadOnlySpan<byte> key)
	{
		ValidateKey(key);
		
		var nonce = RandomNumberGenerator.GetBytes(NonceSize);
		var cipherText = new byte[plainText.Length];
		var tag = new byte[TagSize];

		using var aes = new AesGcm(key, TagSize);
		aes.Encrypt(nonce, plainText, cipherText, tag);

		return EncryptedValue.Create(CurrentVersion, nonce, cipherText, tag);
	}

	public byte[] Decrypt(EncryptedValue encrypted, ReadOnlySpan<byte> key)
	{
		ValidateKey(key);
		
		if (encrypted.Version != CurrentVersion)
			throw new InvalidOperationException($"Unsupported encryption version '{encrypted.Version}'.");
		
		var plainText = new byte[encrypted.Ciphertext.Length];
		
		using var aes = new AesGcm(key, TagSize);
		aes.Decrypt(encrypted.Nonce, encrypted.Ciphertext, encrypted.Tag, plainText);

		return plainText;
	}

	private static void ValidateKey(ReadOnlySpan<byte> key)
	{
		if (key.Length != 32)
			throw new ArgumentException("Key must be 32 bytes.", nameof(key));
	}
}
