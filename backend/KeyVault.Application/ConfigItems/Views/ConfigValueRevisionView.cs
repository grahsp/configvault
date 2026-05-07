namespace KeyVault.Application.ConfigItems.Views;

public sealed record ConfigValueRevisionView(
	string Value,
	uint Revision,
	string CreatedByDisplayName,
	DateTimeOffset ModifiedAt,
	bool IsCurrent);
