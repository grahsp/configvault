using KeyVault.Api.Authorization;

namespace KeyVault.Api.ConfigItems;

public static class ConfigItemEndpoints
{
	public static void AddConfigItemEndpoints(this IEndpointRouteBuilder builder)
	{
		var configItems = builder.MapGroup("/projects/{projectId}/config-items")
			.RequireAuthorization(Policies.ActiveUser)
			.WithTags("Config Items");

		configItems.MapGet("", GetConfigItems.Endpoint.Handle);
		configItems.MapPost("", AddConfigItem.Endpoint.Handle);
		configItems.MapPatch("/{configItemId}", RenameConfigItem.Endpoint.Handle);
		configItems.MapDelete("/{configItemId}", RemoveConfigItem.Endpoint.Handle);
		
		var configValues = builder.MapGroup("/projects/{projectId}/config-items/{configItemId}/values")
			.RequireAuthorization(Policies.ActiveUser)
			.WithTags("Config Values");
		
		configValues.MapPut("", SetConfigValue.Endpoint.Handle);
	}
}