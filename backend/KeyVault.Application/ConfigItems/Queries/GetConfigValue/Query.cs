using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Views;

namespace KeyVault.Application.ConfigItems.Queries.GetConfigValue;

public sealed record Query(Guid ProjectId, Guid ConfigItemId, string EnvironmentName) : IQuery<ConfigValueView?>;