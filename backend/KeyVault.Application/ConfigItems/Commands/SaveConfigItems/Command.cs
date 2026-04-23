using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Domain.ConfigItems;

namespace KeyVault.Application.ConfigItems.Commands.SaveConfigItems;

public sealed record Command(
	Guid ProjectId,
	string EnvironmentName,
	IReadOnlyList<ConfigItemUpdate> Updates,
	IReadOnlyList<Guid> DeleteConfigItemIds) : ICommand<Unit>;

public sealed record ConfigItemUpdate(
	Guid ConfigItemId,
	ConfigKey? Key,
	string? Value);
