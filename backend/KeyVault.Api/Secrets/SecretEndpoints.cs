using KeyVault.Api.Authorization;
using KeyVault.Api.Secrets.BatchOperations.Contracts;

namespace KeyVault.Api.Secrets;

public static class SecretEndpoints
{
	public static void AddSecretEndpoints(this IEndpointRouteBuilder builder)
	{
		var secrets = builder.MapGroup("/projects/{projectId}/secrets")
			.RequireAuthorization(AuthorizationPolicies.UserOnly)
			.WithTags("Secrets");

		secrets.MapGet("", GetSecretsEndpoint.Handle);
		secrets.MapPost("", AddSecretEndpoint.Handle);
		secrets.MapPut("", SaveSecretsEndpoint.Handle);
		secrets.MapPost("/operations", BatchSecretOperationsEndpoint.Handle);
		secrets.MapPatch("/{configItemId}", RenameSecretEndpoint.Handle);
		secrets.MapDelete("/{configItemId}", RemoveSecretEndpoint.Handle);
		
		var secretValues = builder.MapGroup("/projects/{projectId}")
			.WithTags("Secrets");
		
		secretValues.MapGet("/export", ExportSecretsEndpoint.Handle);
		secretValues.MapPost("/import", ImportSecretsEndpoint.Handle);
		
		secretValues.MapPut("/secrets/{configItemId}/value", SetSecretValueEndpoint.Handle);
		secretValues.MapGet("/secrets/{configItemId}/value", GetSecretValueEndpoint.Handle);
		secretValues.MapGet("/secrets/{configItemId}/value/revisions", GetSecretValueRevisionsEndpoint.Handle);
		secretValues.MapGet("/secrets/{configItemId}/value/revisions/{revision}", GetSecretValueRevisionEndpoint.Handle);
		secretValues.MapPost("/secrets/{configItemId}/value/revisions/{revision}/restore", RestoreSecretValueRevisionEndpoint.Handle);
	}
}
