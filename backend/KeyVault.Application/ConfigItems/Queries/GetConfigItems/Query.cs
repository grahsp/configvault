using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Views;

namespace KeyVault.Application.ConfigItems.Queries.GetConfigItems;

public sealed record Query(Guid ProjectId, string EnvironmentName) : IQuery<IReadOnlyList<ConfigItemSummary>>;