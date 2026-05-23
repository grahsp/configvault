using System.Text.Json.Serialization;

namespace KeyVault.Api.Secrets.BatchOperations.Contracts;

[JsonPolymorphic(
	TypeDiscriminatorPropertyName = "type",
	UnknownDerivedTypeHandling = JsonUnknownDerivedTypeHandling.FailSerialization)]
[JsonDerivedType(typeof(CreateSecretOperationRequest), "create")]
[JsonDerivedType(typeof(SetSecretValueOperationRequest), "set-value")]
[JsonDerivedType(typeof(RenameSecretOperationRequest), "rename")]
[JsonDerivedType(typeof(DeleteSecretOperationRequest), "delete")]
public abstract record SecretOperationRequest;
