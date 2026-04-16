using KeyVault.Domain;

namespace KeyVault.Infrastructure.Cryptography;

public interface IAeadEncryption
{
	EncryptedValue Encrypt(ReadOnlySpan<byte> plainText, ReadOnlySpan<byte> key);
	byte[] Decrypt(EncryptedValue encrypted, ReadOnlySpan<byte> key);
}