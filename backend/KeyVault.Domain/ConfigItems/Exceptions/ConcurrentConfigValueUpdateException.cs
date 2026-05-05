using KeyVault.Domain.Exceptions;

namespace KeyVault.Domain.ConfigItems.Exceptions;

public sealed class ConcurrentConfigValueUpdateException()
	: DomainException("Config value changed concurrently. Refresh the current revision and retry.");
