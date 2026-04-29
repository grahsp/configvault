using Microsoft.Net.Http.Headers;

namespace KeyVault.Infrastructure.ConfigItems.Formats;

internal static class ContentTypeNormalizer
{
	public static string Normalize(string? contentType)
	{
		if (string.IsNullOrWhiteSpace(contentType))
			throw new UnsupportedMediaTypeException(contentType);

		return MediaTypeHeaderValue.Parse(contentType).MediaType.Value
			?? throw new UnsupportedMediaTypeException(contentType);
	}
}
