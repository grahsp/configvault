namespace KeyVault.Infrastructure.Configuration;

public class DatabaseOptions
{
	public const string Section = "Database";

	public string ConnectionString { get; set; } = string.Empty;
}