using KeyVault.Api.Authorization;
using KeyVault.Api.ConfigItems.BatchOperations;

namespace KeyVault.Api.ConfigItems;

public static class ConfigItemEndpoints
{
	public static void AddConfigItemEndpoints(this IEndpointRouteBuilder builder)
	{
		var configItems = builder.MapGroup("/projects/{projectId}/config-items")
			.RequireAuthorization(AuthorizationPolicies.UserOnly)
			.WithTags("Config Items");

		configItems.MapGet("", GetConfigItems.Endpoint.Handle);
		configItems.MapPost("", AddConfigItem.Endpoint.Handle);
		configItems.MapPut("", SaveConfigItems.Endpoint.Handle);
		configItems.MapPost("/operations", BatchOperationsEndpoint.Handle);
		configItems.MapPatch("/{configItemId}", RenameConfigItem.Endpoint.Handle);
		configItems.MapDelete("/{configItemId}", RemoveConfigItem.Endpoint.Handle);
		
		var configValues = builder.MapGroup("/projects/{projectId}/config-items/{configItemId}/value")
			.WithTags("Config Values");
		
		configValues.MapPut("", SetConfigValue.Endpoint.Handle);
		configValues.MapGet("", GetConfigValue.Endpoint.Handle);
	}
}
