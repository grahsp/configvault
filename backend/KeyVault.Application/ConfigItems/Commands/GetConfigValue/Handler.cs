using KeyVault.Application.Abstractions.Cryptography;
using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.ConfigItems.Views;
using KeyVault.Application.Projects;

namespace KeyVault.Application.ConfigItems.Commands.GetConfigValue;

public sealed class Handler(
	IUserContext user,
	IProjectRepository projects,
	IConfigItemRepository configurations,
	IEnvelopeEncryptionService encryption)
	: IQueryHandler<Query, ConfigValueView?>
{
	public async Task<ConfigValueView?> HandleAsync(Query query, CancellationToken ct)
	{
		var project = await projects.GetByIdAsync(query.ProjectId, ct);

		if (project is null || !project.IsMember(user.UserId))
			return null;

		if (!project.TryGetEnvironment(query.EnvironmentName, out var environment))
			return null;

		var configuration = await configurations.GetByIdAsync(query.ConfigItemId, ct);

		if (configuration is null || configuration.ProjectId != query.ProjectId)
			return null;

		if (!configuration.TryGetValue(environment.Id, out var value))
			return null;

		var decrypted = encryption.DecryptSecret(value.Value, project.CurrentDataKey.Value);
		return new ConfigValueView(decrypted, value.LastModifiedAt);
	}
}
