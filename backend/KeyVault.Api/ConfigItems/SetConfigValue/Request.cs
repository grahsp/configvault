namespace KeyVault.Api.ConfigItems.SetConfigValue;

public sealed record Request(string Value, uint ExpectedRevision);
