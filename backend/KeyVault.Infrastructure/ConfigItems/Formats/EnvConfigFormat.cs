using KeyVault.Application.ConfigItems.Queries.GetExportedValues;

namespace KeyVault.Infrastructure.ConfigItems.Formats;

public sealed class EnvConfigFormat : IConfigImporter, IConfigExporter
{
	public IReadOnlyCollection<string> SupportedContentTypes { get; } = ["text/plain"];

	public IReadOnlyList<ConfigKeyValue> Parse(string content)
	{
		var result = new List<ConfigKeyValue>();
		var lines = content.Split('\n');

		foreach (var raw in lines)
		{
			var line = raw.Trim();

			if (string.IsNullOrEmpty(line) || line.StartsWith("#"))
				continue;

			var idx = line.IndexOf('=');
			if (idx <= 0)
				throw new FormatException($"Invalid line: '{line}'");

			var key = line[..idx].Trim();
			var value = line[(idx + 1)..].Trim();

			result.Add(new ConfigKeyValue(key, Unescape(value)));
		}

		return result;
	}

	public string Export(IEnumerable<ConfigKeyValue> items)
	{
		return string.Join("\n", items.Select(i => $"{i.Key}={Escape(i.Value)}"));
	}

	private static string Unescape(string value)
	{
		if (value.Length >= 2 && value.StartsWith('"') && value.EndsWith('"'))
		{
			var inner = value[1..^1];

			return inner
				.Replace("\\n", "\n")
				.Replace("\\r", "\r")
				.Replace("\\t", "\t")
				.Replace("\\\"", "\"");
		}

		return value;
	}

	private static string Escape(string value)
	{
		if (string.IsNullOrEmpty(value))
			return "";

		var needsQuotes =
			value.Contains(' ') ||
			value.Contains('"') ||
			value.Contains('=') ||
			value.Contains('\n');

		if (!needsQuotes)
			return value;

		var escaped = value.Replace("\"", "\\\"");
		return $"\"{escaped}\"";
	}
}