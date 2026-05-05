using KeyVault.Application.Exceptions;

namespace KeyVault.Application.ConfigItems.Exceptions;

public sealed class ConfigValueRevisionNotFoundException(Guid configItemId, uint revision) : NotFoundException
{
	public Guid ConfigItemId { get; } = configItemId;
	public uint Revision { get; } = revision;
}
