namespace KeyVault.Infrastructure.Cryptography;

public sealed class EncryptionOptions
{
	public const string Section = "Encryption";
	
	public string MasterKey { get; set; } = null!;
}