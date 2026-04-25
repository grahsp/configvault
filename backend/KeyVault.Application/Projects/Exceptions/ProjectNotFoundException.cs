using KeyVault.Application.Exceptions;

namespace KeyVault.Application.Projects.Exceptions;

public sealed class ProjectNotFoundException(Guid id) : NotFoundException
{
	public Guid Id { get; } = id;
}