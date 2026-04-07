namespace KeyVault.Api.Authentication;

public sealed class IdentityProviderOptions
{
	public const string Section = "IdentityProvider";
	
	public string Authority { get; set; } = string.Empty;
	public string Audience { get; set; } = string.Empty;
	
	public string Issuer => new Uri(Authority).Host;
}