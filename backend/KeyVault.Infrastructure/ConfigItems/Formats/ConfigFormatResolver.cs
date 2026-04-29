namespace KeyVault.Infrastructure.ConfigItems.Formats;

public sealed class ConfigFormatResolver(
	IEnumerable<IConfigImporter> importers,
	IEnumerable<IConfigExporter> exporters)
	: IConfigFormatResolver
{
	public IConfigImporter GetImporter(string? contentType)
	{
		var normalizedContentType = ContentTypeNormalizer.Normalize(contentType);

		var importer = importers.FirstOrDefault(candidate =>
			candidate.SupportedContentTypes.Contains(normalizedContentType, StringComparer.OrdinalIgnoreCase));

		return importer ?? throw new UnsupportedMediaTypeException(contentType);
	}

	public IConfigExporter GetExporter(string contentType)
	{
		var normalizedContentType = ContentTypeNormalizer.Normalize(contentType);
		var exporter = exporters.FirstOrDefault(candidate =>
			candidate.SupportedContentTypes.Contains(normalizedContentType, StringComparer.OrdinalIgnoreCase));

		return exporter ?? throw new UnsupportedMediaTypeException(contentType);
	}
}