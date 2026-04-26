using System.Text.Json.Serialization;

namespace KeyVault.Api.ConfigItems.BatchOperations.Operations;

[JsonPolymorphic(
	TypeDiscriminatorPropertyName = "type",
	UnknownDerivedTypeHandling = JsonUnknownDerivedTypeHandling.FailSerialization)]
[JsonDerivedType(typeof(CreateConfigItemRequest), "create")]
[JsonDerivedType(typeof(SetConfigItemValueRequest), "set-value")]
[JsonDerivedType(typeof(RenameConfigItemRequest), "rename")]
[JsonDerivedType(typeof(DeleteConfigItemRequest), "delete")]
public abstract record ConfigItemOperationRequest;