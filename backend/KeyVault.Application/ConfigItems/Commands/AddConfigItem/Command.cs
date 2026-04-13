using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Views;
using KeyVault.Domain.ConfigItems;

namespace KeyVault.Application.ConfigItems.Commands.AddConfigItem;

public sealed record Command(Guid ProjectId, ConfigKey Key) : ICommand<Unit>;