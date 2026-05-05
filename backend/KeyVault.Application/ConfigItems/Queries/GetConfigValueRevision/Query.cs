using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Views;

namespace KeyVault.Application.ConfigItems.Queries.GetConfigValueRevision;

public sealed record Query(Guid ProjectId, Guid ConfigItemId, string EnvironmentName, uint Revision)
	: IQuery<ConfigValueRevisionView?>;
