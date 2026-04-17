namespace KeyVault.Application.Abstractions.Cryptography;

public interface IMasterKeyProvider
{
	ReadOnlySpan<byte> GetKey();
}
