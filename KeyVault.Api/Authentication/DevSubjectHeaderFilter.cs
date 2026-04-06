using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace KeyVault.Api.Authentication;

public class DevSubjectHeaderFilter : IOperationFilter
{
	public void Apply(OpenApiOperation operation, OperationFilterContext context)
	{
		var authorize = context.MethodInfo
			.GetCustomAttributes(true)
			.OfType<AuthorizeAttribute>()
			.Any();
			
		if (authorize)
		{
			operation.Parameters ??= [];

			operation.Parameters.Add(new OpenApiParameter
			{
				Name = "X-Dev-Sub",
				In = ParameterLocation.Header,
				Required = false,
				Description = "Dev Subject",
				Schema = new OpenApiSchema
				{
					Type = JsonSchemaType.String
				}
			});
		}
	}
}