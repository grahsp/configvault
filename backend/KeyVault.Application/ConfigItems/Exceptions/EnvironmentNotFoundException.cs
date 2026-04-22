using KeyVault.Application.Exceptions;

namespace KeyVault.Application.ConfigItems.Exceptions;

public sealed class EnvironmentNotFoundException : NotFoundException
{
	public EnvironmentNotFoundException(Guid id) : base($"Environment '{id}' not found.") {}
	public EnvironmentNotFoundException(string name) : base($"Environment '{name}' not found.") {}
}
