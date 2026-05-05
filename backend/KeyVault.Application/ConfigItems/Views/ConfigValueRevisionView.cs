namespace KeyVault.Application.ConfigItems.Views;

public sealed record ConfigValueRevisionView(
	string Value,
	uint Revision,
	string ModifiedBy,
	DateTimeOffset ModifiedAt,
	bool IsCurrent);
