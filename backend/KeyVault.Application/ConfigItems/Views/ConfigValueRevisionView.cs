namespace KeyVault.Application.ConfigItems.Views;

public sealed record ConfigValueRevisionView(
	string Value,
	uint Revision,
	string ModifiedByDisplayName,
	DateTimeOffset ModifiedAt,
	bool IsCurrent);
