using KeyVault.Domain;

namespace KeyVault.Application.Abstractions.Cryptography;

public interface IEnvelopeEncryptionService
{
	EncryptedValue GenerateDataKey();
	EncryptedValue EncryptSecret(string plainText, EncryptedValue wrappedKey);
	string DecryptSecret(EncryptedValue value, EncryptedValue wrappedKey);
}
