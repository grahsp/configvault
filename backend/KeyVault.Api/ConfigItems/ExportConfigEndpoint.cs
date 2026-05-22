using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Queries;
using KeyVault.Infrastructure.ConfigItems.Formats;

namespace KeyVault.Api.ConfigItems;

internal static class ExportConfigEndpoint
{
	internal static async Task<IResult> Handle(
		IQueryDispatcher dispatcher,
		IConfigFormatResolver formatResolver,
		Guid projectId,
		string environment,
		CancellationToken ct)
	{
		var query = new GetExportedValuesQuery(projectId, environment);
		var result = await dispatcher.DispatchAsync(query, ct);
		var formatter = formatResolver.GetExporter("text/plain");
		var response = formatter.Export(result);
		
		return Results.Text(response);
	}
}
