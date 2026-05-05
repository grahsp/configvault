namespace KeyVault.Application.ConfigItems.Views;

public sealed record ConfigValueRevisionSummaryView(
	uint Revision,
	string ModifiedBy,
	DateTimeOffset ModifiedAt,
	bool IsCurrent);
