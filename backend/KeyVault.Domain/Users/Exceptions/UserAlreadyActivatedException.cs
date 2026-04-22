using KeyVault.Domain.Exceptions;

namespace KeyVault.Domain.Users.Exceptions;

public sealed class UserAlreadyActivatedException()
	: BusinessRuleViolationException("User has already been activated");
