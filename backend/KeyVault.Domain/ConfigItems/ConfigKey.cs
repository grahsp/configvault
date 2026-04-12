using System.Diagnostics.CodeAnalysis;
using System.Text.RegularExpressions;
using KeyVault.Domain.ConfigItems.Exceptions;

namespace KeyVault.Domain.ConfigItems;

public record ConfigKey
{
	public string Value { get; }
	
	private static readonly Regex Pattern =
		new Regex("^[A-Z0-9_]+$", RegexOptions.Compiled);

	private ConfigKey(string value)
	{
		Value = value;
	}

	public static ConfigKey Create(string input)
	{
		ArgumentException.ThrowIfNullOrWhiteSpace(input);

		var normalized = Normalize(input);

		if (!Pattern.IsMatch(normalized))
			throw new InvalidConfigKeyException(input);
		
		return new ConfigKey(normalized);
	}

	public static bool TryParse(string input, [NotNullWhen(true)] out ConfigKey? key)
	{
		key = null;

		if (string.IsNullOrWhiteSpace(input))
			return false;

		var normalized = Normalize(input);
		
		if (!Pattern.IsMatch(normalized))
			return false;
		
		key = new ConfigKey(normalized);
		return true;
	}
	
	private static string Normalize(string input)
		=> input.Trim().ToUpperInvariant();

	public override string ToString() => Value;
}