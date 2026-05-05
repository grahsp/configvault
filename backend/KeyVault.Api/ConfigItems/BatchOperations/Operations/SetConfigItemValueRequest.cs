using System.Text.Json.Serialization;

namespace KeyVault.Api.ConfigItems.BatchOperations.Operations;

public sealed record SetConfigItemValueRequest(
	[property: JsonPropertyName("secretId")]
	Guid ConfigItemId,
	string Value,
	uint ExpectedRevision) : ConfigItemOperationRequest;
