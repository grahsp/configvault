using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.ConfigItems.Commands.RestoreConfigValueRevision;

public sealed record Command(
	Guid ProjectId,
	Guid ConfigItemId,
	string EnvironmentName,
	uint Revision,
	uint ExpectedRevision) : ICommand<Unit>;
