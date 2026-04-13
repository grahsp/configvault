using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Views;
using KeyVault.Domain.ConfigItems;

namespace KeyVault.Application.ConfigItems.Commands.RenameConfigItem;

public sealed record Command(Guid ProjectId, Guid ConfigItemId, ConfigKey Key) : ICommand<Unit>;