using System.Security.Cryptography;
using System.Text;
using KeyVault.Application.Abstractions.Cryptography;
using KeyVault.Domain;

namespace KeyVault.Infrastructure.Cryptography;

public sealed class EnvelopeEncryptionService(
	IAeadEncryption crypto,
	IMasterKeyProvider master)
	: IEnvelopeEncryptionService
{
	public EncryptedValue GenerateDataKey()
	{
		var masterKey = master.GetKey();
		var key = RandomNumberGenerator.GetBytes(32);

		try
		{
			return crypto.Encrypt(key, masterKey);
		}
		finally
		{
			CryptographicOperations.ZeroMemory(key);
		}
	}
	
	public EncryptedValue EncryptSecret(string plainText, EncryptedValue wrappedKey)
	{
		var masterKey = master.GetKey();
		var key = crypto.Decrypt(wrappedKey, masterKey);

		var bytes = Encoding.UTF8.GetBytes(plainText);

		try
		{
			return crypto.Encrypt(bytes, key);
		}
		finally
		{
			CryptographicOperations.ZeroMemory(key);
			CryptographicOperations.ZeroMemory(bytes);
		}
	}

	public string DecryptSecret(EncryptedValue value, EncryptedValue wrappedKey)
	{
		var masterKey = master.GetKey();
		var key = crypto.Decrypt(wrappedKey, masterKey);

		var bytes = crypto.Decrypt(value, key);

		try
		{
			return Encoding.UTF8.GetString(bytes);
		}
		finally
		{
			CryptographicOperations.ZeroMemory(key);
			CryptographicOperations.ZeroMemory(bytes);
		}
	}
}
