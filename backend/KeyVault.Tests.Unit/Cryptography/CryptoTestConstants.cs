namespace KeyVault.Tests.Unit.Cryptography;

internal static class CryptoTestConstants
{
	public const byte CurrentVersion = 1;
	public const byte UnsupportedVersion = 2;

	public const int VersionSize = 1;
	public const int NonceSize = 12;
	public const int TagSize = 16;
	public const int KeySize = 32;
	public const int DataKeySize = KeySize;

	public const int VersionOffset = 0;
	public const int NonceOffset = VersionOffset + VersionSize;
	public const int CiphertextOffset = NonceOffset + NonceSize;
	public const int MinimumPayloadSize = VersionSize + NonceSize + TagSize;

	public const int EmptyKeySize = 0;
	public const int Aes128KeySize = 16;
	public const int ShortAes256KeySize = KeySize - 1;
	public const int LongAes256KeySize = KeySize + 1;

	public const byte BitFlipMask = 0x01;
	public const byte DefaultKeySeed = 1;
	public const byte MasterKeySeed = 10;
	public const byte OtherMasterKeySeed = 20;
	public const byte IsolatedMasterKeySeed = 30;
	public const byte DifferentIsolatedMasterKeySeed = 60;

	public const int RandomPlaintextSize = 256;
	public const int LargePlaintextSize = 1024 * 1024;
	public const int RandomRoundtripCount = 100;
	public const int RandomByteArraySizeStep = 17;
}
