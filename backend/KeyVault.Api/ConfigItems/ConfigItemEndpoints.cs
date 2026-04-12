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
	}
}