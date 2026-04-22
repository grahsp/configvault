using Microsoft.Extensions.Options;

namespace KeyVault.Api.Configuration;

public static class CorsOriginParser
{
	public static string[] Parse(string? allowedOrigins)
	{
		if (!TryParse(allowedOrigins, out var origins))
		{
			throw new OptionsValidationException(
				nameof(CorsOptions),
				typeof(CorsOptions),
				["Cors allowed origins must be a comma-separated list of absolute URLs without empty values."]);
		}

		return origins;
	}

	public static bool TryParse(string? allowedOrigins, out string[] origins)
	{
		if (string.IsNullOrWhiteSpace(allowedOrigins))
		{
			origins = [];
			return true;
		}

		var parsedOrigins = allowedOrigins
			.Split(',', StringSplitOptions.TrimEntries);

		if (parsedOrigins.Any(string.IsNullOrWhiteSpace))
		{
			origins = [];
			return false;
		}

		if (parsedOrigins.Any(origin => !Uri.TryCreate(origin, UriKind.Absolute, out _)))
		{
			origins = [];
			return false;
		}

		origins = parsedOrigins;
		return true;
	}
}
