namespace KeyVault.Api.ConfigItems.BatchOperations.Operations;

public sealed record SetConfigItemValueRequest(
	Guid ConfigItemId,
	string Value) : ConfigItemOperationRequest;