using System.Security.Cryptography;

namespace KeyVault.Infrastructure.Cryptography.Exceptions;

public sealed class UnsupportedEncryptionVersionException(byte version)
	: CryptographicException($"Unsupported encryption version '{version}'.");
