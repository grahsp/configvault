using System.Text.Json;
using KeyVault.Api.Authentication.Exceptions;
using KeyVault.Application.Exceptions;
using KeyVault.Domain.Exceptions;
using KeyVault.Infrastructure.ConfigItems.Formats;
using Microsoft.AspNetCore.Mvc;

namespace KeyVault.Api.Middleware;

public static class ProblemDetailsFactory
{
	public static ProblemDetails Create(Exception ex)
	{
		return ex switch
		{
			ValidationException => Create(StatusCodes.Status400BadRequest, "Validation failed", ex.Message),
			JsonException => Create(StatusCodes.Status400BadRequest, "Validation failed", ex.Message),
			MissingAuthenticationClaimException => Create(StatusCodes.Status401Unauthorized, "Authentication failed", ex.Message),
			UnsupportedMediaTypeException => Create(StatusCodes.Status415UnsupportedMediaType, "Unsupported media type", ex.Message),
			ForbiddenException => Create(StatusCodes.Status404NotFound, "Resource not found", "The requested resource was not found."),
			NotFoundException => Create(StatusCodes.Status404NotFound, "Resource not found", "The requested resource was not found."),
			DomainException => Create(StatusCodes.Status409Conflict, "Conflict with current state", ex.Message),
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
