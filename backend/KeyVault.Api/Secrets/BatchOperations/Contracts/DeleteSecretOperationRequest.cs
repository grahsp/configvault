using System.Text.Json.Serialization;

namespace KeyVault.Api.Secrets.BatchOperations.Contracts;

public sealed record DeleteSecretOperationRequest(
	[property: JsonPropertyName("secretId")]
	Guid ConfigItemId) : SecretOperationRequest;
