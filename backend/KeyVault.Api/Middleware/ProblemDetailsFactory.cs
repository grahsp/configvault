using System.Security.Cryptography;
using KeyVault.Api.Authentication.Exceptions;
using KeyVault.Application.Exceptions;
using KeyVault.Domain.Exceptions;
using KeyVault.Domain.Projects.Exceptions;
using KeyVault.Infrastructure.Cryptography.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace KeyVault.Api.Middleware;

public static class ProblemDetailsFactory
{
	public static ProblemDetails Create(Exception ex)
	{
		return ex switch
		{
			ValidationException => Create(StatusCodes.Status400BadRequest, "Validation failed", ex.Message),
			MissingAuthenticationClaimException => Create(StatusCodes.Status401Unauthorized, "Authentication failed", ex.Message),
			ForbiddenException => Create(StatusCodes.Status403Forbidden, "Access denied", ex.Message),
			NotFoundException => Create(StatusCodes.Status404NotFound, "Resource not found", ex.Message),
			InsufficientProjectRoleException => Create(StatusCodes.Status403Forbidden, "Access denied", ex.Message),
			BusinessRuleViolationException => Create(StatusCodes.Status409Conflict, "Conflict with current state", ex.Message),
			DomainException => Create(StatusCodes.Status409Conflict, "Conflict with current state", ex.Message),
			DataIntegrityException => Create(StatusCodes.Status500InternalServerError, "Internal server error", "A data integrity error occurred."),
			PersistenceException => Create(StatusCodes.Status500InternalServerError, "Internal server error", "A persistence error occurred."),
			UnsupportedEncryptionVersionException => Create(StatusCodes.Status500InternalServerError, "Internal server error", "An encryption error occurred."),
			CryptographicException => Create(StatusCodes.Status500InternalServerError, "Internal server error", "An encryption error occurred."),
			_ => Create(StatusCodes.Status500InternalServerError, "Internal server error", "An unexpected error occurred.")
		};
	}

	private static ProblemDetails Create(int status, string title, string detail)
	{
		return new ProblemDetails
		{
			Status = status,
			Title = title,
			Detail = detail,
		};
	}
}
