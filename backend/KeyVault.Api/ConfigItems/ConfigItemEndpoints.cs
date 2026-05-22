using KeyVault.Api.Authorization;
using KeyVault.Api.ConfigItems.BatchOperations;

namespace KeyVault.Api.ConfigItems;

public static class ConfigItemEndpoints
{
	public static void AddConfigItemEndpoints(this IEndpointRouteBuilder builder)
	{
		var configItems = builder.MapGroup("/projects/{projectId}/secrets")
			.RequireAuthorization(AuthorizationPolicies.UserOnly)
			.WithTags("Secrets");

		configItems.MapGet("", GetConfigItemsEndpoint.Handle);
		configItems.MapPost("", AddConfigItemEndpoint.Handle);
		configItems.MapPut("", SaveConfigItemsEndpoint.Handle);
		configItems.MapPost("/operations", BatchOperationsEndpoint.Handle);
		configItems.MapPatch("/{configItemId}", RenameConfigItemEndpoint.Handle);
		configItems.MapDelete("/{configItemId}", RemoveConfigItemEndpoint.Handle);
		
		var configValues = builder.MapGroup("/projects/{projectId}")
			.WithTags("Secrets");
		
		configValues.MapGet("/export", ExportConfigEndpoint.Handle);
		configValues.MapPost("/import", ImportConfigEndpoint.Handle);
		
		configValues.MapPut("/secrets/{configItemId}/value", SetConfigValueEndpoint.Handle);
		configValues.MapGet("/secrets/{configItemId}/value", GetConfigValueEndpoint.Handle);
		configValues.MapGet("/secrets/{configItemId}/value/revisions", GetConfigValueRevisionsEndpoint.Handle);
		configValues.MapGet("/secrets/{configItemId}/value/revisions/{revision}", GetConfigValueRevisionEndpoint.Handle);
		configValues.MapPost("/secrets/{configItemId}/value/revisions/{revision}/restore", RestoreConfigValueRevisionEndpoint.Handle);
	}
}
