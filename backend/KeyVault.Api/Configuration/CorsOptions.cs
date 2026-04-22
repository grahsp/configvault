namespace KeyVault.Api.Configuration;

public sealed class CorsOptions
{
	public const string Section = "Cors";
	public const string PolicyName = "ConfiguredOrigins";

	public string AllowedOrigins { get; set; } = string.Empty;
}
