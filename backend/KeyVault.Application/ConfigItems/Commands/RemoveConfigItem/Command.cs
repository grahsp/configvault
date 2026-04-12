using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.ConfigItems.Commands.RemoveConfigItem;

public sealed record Command(Guid ProjectId, Guid ConfigItemId) : ICommand<Unit>;