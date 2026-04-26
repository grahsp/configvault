using KeyVault.Application.Exceptions;

namespace KeyVault.Application.ConfigItems.Exceptions;

public sealed class ConfigItemNotFoundException(params Guid[] missingIds) : NotFoundException
{
	public IReadOnlyList<Guid> MissingIds { get; } = missingIds;
}