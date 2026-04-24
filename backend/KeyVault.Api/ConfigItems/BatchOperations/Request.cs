using KeyVault.Domain.ConfigItems;

namespace KeyVault.Api.ConfigItems.BatchOperations;

public sealed record BatchRequest(
	string Environment,
	IReadOnlyList<Operation> Operations);

public abstract record Operation;

public sealed record CreateItem(
	ConfigKey Key,
	string? InitialValue) : Operation;

public sealed record SetValue(
	Guid ConfigItemId,
	string Value) : Operation;

public sealed record RenameItem(
	Guid ConfigItemId,
	ConfigKey Key) : Operation;

public sealed record DeleteItem(
	Guid ConfigItemId) : Operation;
