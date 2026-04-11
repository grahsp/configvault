using KeyVault.Domain.Exceptions;

namespace KeyVault.Domain.Projects.Exceptions;

public sealed class EnvironmentAlreadyExists(string environment) : DomainException($"Environment '{environment}' already exists in project.");