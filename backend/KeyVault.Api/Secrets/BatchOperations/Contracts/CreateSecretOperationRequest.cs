namespace KeyVault.Api.Secrets.BatchOperations.Contracts;

public sealed record CreateSecretOperationRequest(string Key, string? InitialValue) : SecretOperationRequest;
