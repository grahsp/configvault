namespace KeyVault.Api.ConfigItems.SaveConfigItems;

public sealed record Request(
	string Environment,
	IReadOnlyList<ConfigItemUpdateRequest> Updates,
	IReadOnlyList<Guid> DeleteConfigItemIds);

public sealed record ConfigItemUpdateRequest(
	Guid ConfigItemId,
	string? Key,
	string? Value);
