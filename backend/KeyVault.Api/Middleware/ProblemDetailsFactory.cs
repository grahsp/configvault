using KeyVault.Application.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace KeyVault.Api.Middleware;

public static class ProblemDetailsFactory
{
	public static ProblemDetails Create(Exception ex)
	{
		return ex switch
		{
			ValidationException => Create(StatusCodes.Status400BadRequest, "Validation failed", ex.Message),
			ForbiddenException => Create(StatusCodes.Status403Forbidden, "Access denied", ex.Message),
			NotFoundException => Create(StatusCodes.Status404NotFound, "Resource not found", ex.Message),
			ConflictException => Create(StatusCodes.Status409Conflict, "Conflict with current state", ex.Message),
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