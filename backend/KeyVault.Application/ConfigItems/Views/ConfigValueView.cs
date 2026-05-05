namespace KeyVault.Application.ConfigItems.Views;

public sealed record ConfigValueView(string Value, uint Revision, DateTimeOffset LastModifiedAt);
