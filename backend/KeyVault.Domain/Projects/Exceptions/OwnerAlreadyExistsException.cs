using KeyVault.Domain.Exceptions;

namespace KeyVault.Domain.Projects.Exceptions;

public sealed class OwnerAlreadyExistsException() : DomainException("Project already has an owner");