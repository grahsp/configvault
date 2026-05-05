using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Views;

namespace KeyVault.Application.ConfigItems.Queries.GetConfigValueRevisions;

public sealed record Query(Guid ProjectId, Guid ConfigItemId, string EnvironmentName)
	: IQuery<IReadOnlyList<ConfigValueRevisionSummaryView>>;
