namespace KeyVault.Infrastructure.Cryptography;

public interface IMasterKeyProvider
{
	ReadOnlySpan<byte> GetKey();
}