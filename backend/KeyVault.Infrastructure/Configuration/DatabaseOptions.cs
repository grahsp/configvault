namespace KeyVault.Infrastructure.Configuration;

public class DatabaseOptions
{
	public const string Section = "Database";

	public string Host { get; set; } = string.Empty;
	public int Port { get; set; } = 5432;
	public string Database { get; set; } = string.Empty;
	public string Username { get; set; } = string.Empty;
	public string Password { get; set; } = string.Empty;
	public bool Ssl { get; set; }
	public bool TrustServerCertificate { get; set; }

	public string ConnectionString
	{
		get
		{
			var builder = new Npgsql.NpgsqlConnectionStringBuilder
			{
				Host = Host,
				Port = Port,
				Database = Database,
				Username = Username,
				Password = Password,
				SslMode = Ssl ? Npgsql.SslMode.Require : Npgsql.SslMode.Disable
			};
			builder["Trust Server Certificate"] = TrustServerCertificate;

			return builder.ConnectionString;
		}
	}
}
