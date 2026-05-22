using System.Text;
using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Commands;
using KeyVault.Infrastructure.ConfigItems.Formats;
using Microsoft.AspNetCore.Mvc;

namespace KeyVault.Api.ConfigItems;

internal static class ImportConfigEndpoint
{
	internal static async Task<IResult> Handle(
		ICommandDispatcher dispatcher,
		IConfigFormatResolver formatResolver,
		HttpRequest httpRequest,
		[FromRoute] Guid projectId,
		[FromQuery] string environment,
		CancellationToken ct)
	{
		using var reader = new StreamReader(
			httpRequest.Body,
			Encoding.UTF8,
			detectEncodingFromByteOrderMarks: true,
			leaveOpen: true);
		
		var content = await reader.ReadToEndAsync(ct);
		var parser = formatResolver.GetImporter(httpRequest.ContentType);
		var keyValues = parser.Parse(content);
		
		var command = new CreateImportedItemsCommand(projectId, environment, keyValues);
		await dispatcher.DispatchAsync(command, ct);
		
		return Results.Ok();
	}
}
