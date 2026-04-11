using KeyVault.Domain.Exceptions;

namespace KeyVault.Domain.Projects.Exceptions;

public sealed class ProjectMemberNotFoundException() : DomainException("Project does not contain member");