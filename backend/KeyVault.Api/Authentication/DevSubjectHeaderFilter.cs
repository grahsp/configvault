using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace KeyVault.Api.Authentication;

public class DevSubjectHeaderFilter : IOperationFilter
{
	public void Apply(OpenApiOperation operation, OperationFilterContext context)
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