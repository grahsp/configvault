using KeyVault.Application.ConfigItems.Queries.GetExportedValues;

namespace KeyVault.Infrastructure.ConfigItems.Formats;

public interface IConfigImporter
{
	IReadOnlyCollection<string> SupportedContentTypes { get; }
	IReadOnlyList<ConfigKeyValue> Parse(string content);
}