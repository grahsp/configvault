namespace KeyVault.Api.ConfigItems.BatchOperations.Operations;

public sealed record CreateConfigItemRequest(string Key, string? InitialValue) : ConfigItemOperationRequest;