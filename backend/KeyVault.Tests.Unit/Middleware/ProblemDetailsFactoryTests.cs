using System.Security.Cryptography;
using System.Text.Json;
using KeyVault.Api.Middleware;
using KeyVault.Api.Authentication.Exceptions;
using KeyVault.Application.Exceptions;
using KeyVault.Domain.Exceptions;
using KeyVault.Domain.Projects.Exceptions;
using KeyVault.Infrastructure.Cryptography.Exceptions;

namespace KeyVault.Tests.Unit.Middleware;

public sealed class ProblemDetailsFactoryTests
{
	[Fact]
	public void Create_ShouldMapMissingAuthenticationClaim_ToUnauthorized()
	{
		var problem = ProblemDetailsFactory.Create(new MissingAuthenticationClaimException("iss"));

		Assert.Equal(401, problem.Status);
		Assert.Equal("Authentication failed", problem.Title);
	}

	[Fact]
	public void Create_ShouldMapInsufficientProjectRole_ToForbidden()
	{
		var problem = ProblemDetailsFactory.Create(new InsufficientProjectRoleException());

		Assert.Equal(403, problem.Status);
		Assert.Equal("Access denied", problem.Title);
	}

	[Fact]
	public void Create_ShouldMapBusinessRuleViolation_ToConflict()
	{
		var problem = ProblemDetailsFactory.Create(new BusinessRuleViolationException("Conflict"));

		Assert.Equal(409, problem.Status);
		Assert.Equal("Conflict with current state", problem.Title);
	}

	[Fact]
	public void Create_ShouldMapJsonException_ToBadRequest()
	{
		var problem = ProblemDetailsFactory.Create(new JsonException("Bad JSON payload"));

		Assert.Equal(400, problem.Status);
		Assert.Equal("Validation failed", problem.Title);
		Assert.Equal("Bad JSON payload", problem.Detail);
	}

	[Theory]
	[InlineData(typeof(DataIntegrityException))]
	[InlineData(typeof(PersistenceException))]
	[InlineData(typeof(UnsupportedEncryptionVersionException))]
	[InlineData(typeof(CryptographicException))]
	public void Create_ShouldSanitizeInfrastructureFailures(Type exceptionType)
	{
		Exception exception = exceptionType == typeof(DataIntegrityException)
			? new DataIntegrityException("details")
			: exceptionType == typeof(PersistenceException)
				? new PersistenceException("details")
				: exceptionType == typeof(UnsupportedEncryptionVersionException)
					? new UnsupportedEncryptionVersionException(99)
					: new CryptographicException("details");

		var problem = ProblemDetailsFactory.Create(exception);

		Assert.Equal(500, problem.Status);
		Assert.Equal("Internal server error", problem.Title);
		Assert.DoesNotContain("details", problem.Detail ?? string.Empty);
	}
}
