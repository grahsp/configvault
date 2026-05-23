using System.Text.Json.Serialization;

namespace KeyVault.Api.Secrets.BatchOperations.Contracts;

public sealed record SetSecretValueOperationRequest(
	[property: JsonPropertyName("secretId")]
	Guid ConfigItemId,
	string Value,
	uint ExpectedRevision) : SecretOperationRequest;
