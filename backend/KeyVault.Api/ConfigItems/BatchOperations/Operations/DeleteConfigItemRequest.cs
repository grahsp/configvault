namespace KeyVault.Api.ConfigItems.BatchOperations.Operations;

public sealed record DeleteConfigItemRequest(Guid ConfigItemId) : ConfigItemOperationRequest;