using KeyVault.Application.Exceptions;

namespace KeyVault.Application.ConfigItems.Exceptions;

public sealed class ConfigItemNotFoundException(Guid id) : NotFoundException
{
	public Guid Id { get; } = id;
}