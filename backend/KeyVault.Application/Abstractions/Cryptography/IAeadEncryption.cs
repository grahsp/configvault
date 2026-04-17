using KeyVault.Domain;

namespace KeyVault.Application.Abstractions.Cryptography;

public interface IAeadEncryption
{
	EncryptedValue Encrypt(ReadOnlySpan<byte> plainText, ReadOnlySpan<byte> key);
	byte[] Decrypt(EncryptedValue encrypted, ReadOnlySpan<byte> key);
}
