using KeyVault.Domain.Exceptions;

namespace KeyVault.Domain.Projects.Exceptions;

public class MissingCapabilityException(ProjectCapability capability)
	: DomainException($"Missing capability: {capability}");