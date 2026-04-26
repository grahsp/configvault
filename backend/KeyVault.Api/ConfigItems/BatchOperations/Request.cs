using KeyVault.Api.ConfigItems.BatchOperations.Operations;

namespace KeyVault.Api.ConfigItems.BatchOperations;

public sealed record Request(string Environment, IReadOnlyList<ConfigItemOperationRequest> Operations);