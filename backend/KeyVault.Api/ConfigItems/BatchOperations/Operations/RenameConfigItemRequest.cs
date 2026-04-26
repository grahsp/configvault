namespace KeyVault.Api.ConfigItems.BatchOperations.Operations;

public sealed record RenameConfigItemRequest(
	Guid ConfigItemId,
	string Key) : ConfigItemOperationRequest;