using KeyVault.Domain;

namespace KeyVault.Infrastructure.Cryptography;

public interface IEnvelopeEncryptionService
{
	EncryptedValue GenerateDataKey();
	EncryptedValue EncryptSecret(string plainText, EncryptedValue wrappedKey);
	string DecryptSecret(EncryptedValue value, EncryptedValue wrappedKey);
}