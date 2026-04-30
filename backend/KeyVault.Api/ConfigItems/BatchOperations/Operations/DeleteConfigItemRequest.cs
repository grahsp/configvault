using System.Text.Json.Serialization;

namespace KeyVault.Api.ConfigItems.BatchOperations.Operations;

public sealed record DeleteConfigItemRequest(
	[property: JsonPropertyName("secretId")]
	Guid ConfigItemId) : ConfigItemOperationRequest;
