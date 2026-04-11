using KeyVault.Domain.Exceptions;

namespace KeyVault.Domain.Projects.Exceptions;

public sealed class ProjectMemberAlreadyExistsException(string message) : DomainException(message);