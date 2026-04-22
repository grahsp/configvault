using KeyVault.Domain.Exceptions;

namespace KeyVault.Domain.Users.Exceptions;

public sealed class DuplicateExternalLoginException()
	: BusinessRuleViolationException("User already has an external login for this subject");
