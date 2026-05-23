using System.Text.Json.Serialization;

namespace KeyVault.Api.Secrets.BatchOperations.Contracts;

public sealed record RenameSecretOperationRequest(
	[property: JsonPropertyName("secretId")]
	Guid ConfigItemId,
	string Key) : SecretOperationRequest;
