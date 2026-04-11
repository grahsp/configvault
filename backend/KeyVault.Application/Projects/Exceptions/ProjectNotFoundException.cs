using KeyVault.Application.Exceptions;

namespace KeyVault.Application.Projects.Exceptions;

public sealed class ProjectNotFoundException(Guid id) : NotFoundException($"Project '{id}' was not found.");