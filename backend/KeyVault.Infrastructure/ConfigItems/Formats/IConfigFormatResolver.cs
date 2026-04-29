namespace KeyVault.Infrastructure.ConfigItems.Formats;

public interface IConfigFormatResolver
{
	IConfigImporter GetImporter(string? contentType);
	IConfigExporter GetExporter(string contentType);
}