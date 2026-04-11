using KeyVault.Domain.Exceptions;

namespace KeyVault.Domain.Projects.Exceptions;

public sealed class InvalidRoleException() : DomainException("Owner role cannot be assigned");