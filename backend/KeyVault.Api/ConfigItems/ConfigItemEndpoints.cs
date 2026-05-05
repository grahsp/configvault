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

		configItems.MapGet("", GetConfigItems.Endpoint.Handle);
		configItems.MapPost("", AddConfigItem.Endpoint.Handle);
		configItems.MapPut("", SaveConfigItems.Endpoint.Handle);
		configItems.MapPost("/operations", BatchOperationsEndpoint.Handle);
		configItems.MapPatch("/{configItemId}", RenameConfigItem.Endpoint.Handle);
		configItems.MapDelete("/{configItemId}", RemoveConfigItem.Endpoint.Handle);
		
		var configValues = builder.MapGroup("/projects/{projectId}")
			.WithTags("Secrets");
		
		configValues.MapGet("/export", ExportConfig.Endpoint.Handle);
		configValues.MapPost("/import", ImportConfig.Endpoint.Handle);
		
		configValues.MapPut("/secrets/{configItemId}/value", SetConfigValue.Endpoint.Handle);
		configValues.MapGet("/secrets/{configItemId}/value", GetConfigValue.Endpoint.Handle);
		configValues.MapGet("/secrets/{configItemId}/value/revisions", GetConfigValueRevisions.Endpoint.Handle);
		configValues.MapGet("/secrets/{configItemId}/value/revisions/{revision}", GetConfigValueRevision.Endpoint.Handle);
		configValues.MapPost("/secrets/{configItemId}/value/revisions/{revision}/restore", RestoreConfigValueRevision.Endpoint.Handle);
	}
}
