using KeyVault.Domain.Exceptions;

namespace KeyVault.Domain.Projects.Exceptions;

public sealed class ProjectMemberAlreadyExistsException() : DomainException("User already member of project");