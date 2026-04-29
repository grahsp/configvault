using KeyVault.Application.ConfigItems.Queries.GetExportedValues;

namespace KeyVault.Infrastructure.ConfigItems.Formats;

public interface IConfigExporter
{
	IReadOnlyCollection<string> SupportedContentTypes { get; }
	string Export(IEnumerable<ConfigKeyValue> items);
}