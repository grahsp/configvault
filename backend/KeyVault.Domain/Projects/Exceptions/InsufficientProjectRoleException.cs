using KeyVault.Domain.Exceptions;

namespace KeyVault.Domain.Projects.Exceptions;

public sealed class InsufficientProjectRoleException() : DomainException("User does not have permission for this action");