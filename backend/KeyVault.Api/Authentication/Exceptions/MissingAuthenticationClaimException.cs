using KeyVault.Application.Exceptions;

namespace KeyVault.Api.Authentication.Exceptions;

public sealed class MissingAuthenticationClaimException(string claimType)
	: AppException($"Missing required authentication claim '{claimType}'.");
