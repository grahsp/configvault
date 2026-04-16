using Microsoft.Extensions.Options;

namespace KeyVault.Infrastructure.Cryptography;

public class ConfigurationMasterKeyProvider : IMasterKeyProvider
{
	private readonly byte[] _key;
	
	public ConfigurationMasterKeyProvider(IOptions<EncryptionOptions> options)
	{
		var key = options.Value.MasterKey;
		ArgumentException.ThrowIfNullOrWhiteSpace(key);
		
		_key = Convert.FromBase64String(options.Value.MasterKey).ToArray();
	}
	
	public ReadOnlySpan<byte> GetKey() => _key;
}