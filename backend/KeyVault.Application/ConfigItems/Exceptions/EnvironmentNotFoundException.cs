using KeyVault.Application.Exceptions;

namespace KeyVault.Application.ConfigItems.Exceptions;

public sealed class EnvironmentNotFoundException(string name) : NotFoundException
{
	public string Environment { get; } = name;
}
