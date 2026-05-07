namespace KeyVault.Application.ConfigItems.Views;

public sealed record ConfigValueRevisionSummaryView(
	uint Revision,
	string CreatedByDisplayName,
	DateTimeOffset ModifiedAt,
	bool IsCurrent);
