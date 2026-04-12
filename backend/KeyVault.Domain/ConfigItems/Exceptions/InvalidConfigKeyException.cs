using KeyVault.Domain.Exceptions;

namespace KeyVault.Domain.ConfigItems.Exceptions;

public sealed class InvalidConfigKeyException(string input) : DomainException($"Invalid config key: '{input}'");