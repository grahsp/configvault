using KeyVault.Domain.Exceptions;

namespace KeyVault.Domain.Projects.Exceptions;

public sealed class CannotRemoveOwnerException(string message) : DomainException(message);