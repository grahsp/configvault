using System.Text.Json.Serialization;
namespace KeyVault.Api.ConfigItems.BatchOperations;

public sealed record BatchRequest(
	string Environment,
	IReadOnlyList<Operation> Operations);

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(CreateItem), "create")]
[JsonDerivedType(typeof(SetValue), "set-value")]
[JsonDerivedType(typeof(RenameItem), "rename")]
[JsonDerivedType(typeof(DeleteItem), "delete")]
public abstract record Operation;

public sealed record CreateItem(
	string Key,
	string? InitialValue) : Operation;

public sealed record SetValue(
	Guid ConfigItemId,
	string Value) : Operation;

public sealed record RenameItem(
	Guid ConfigItemId,
	string Key) : Operation;

public sealed record DeleteItem(
	Guid ConfigItemId) : Operation;
