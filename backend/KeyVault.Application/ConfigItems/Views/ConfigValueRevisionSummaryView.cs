namespace KeyVault.Application.ConfigItems.Views;

public sealed record ConfigValueRevisionSummaryView(
	uint Revision,
	string ModifiedByDisplayName,
	DateTimeOffset ModifiedAt,
	bool IsCurrent);
