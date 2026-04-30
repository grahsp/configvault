using System.Text.Json.Serialization;

namespace KeyVault.Api.ConfigItems.BatchOperations.Operations;

public sealed record RenameConfigItemRequest(
	[property: JsonPropertyName("secretId")]
	Guid ConfigItemId,
	string Key) : ConfigItemOperationRequest;
