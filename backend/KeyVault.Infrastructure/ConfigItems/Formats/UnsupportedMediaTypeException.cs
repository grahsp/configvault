namespace KeyVault.Infrastructure.ConfigItems.Formats;

public sealed class UnsupportedMediaTypeException(string? contentType)
	: Exception($"Unsupported import/export content type: '{contentType ?? "(missing)"}'.");