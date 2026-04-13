using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.ConfigItems.Commands.SetConfigValue;

public sealed record Command(Guid ProjectId, Guid ConfigItemId, string EnvironmentName, string Value) : ICommand<Unit>;