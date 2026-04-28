using KeyVault.Application.Abstractions.Cryptography;
using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Actions;
using KeyVault.Application.ConfigItems.Exceptions;
using KeyVault.Application.ConfigItems.Views;
using KeyVault.Application.Projects;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.ConfigItems.Queries.GetConfigValue;

public sealed class Handler(
	IProjectRepository projects,
	IConfigItemRepository configurations,
	IProjectAuthorizationService authorization,
	IEnvelopeEncryptionService encryption)
	: IQueryHandler<Query, ConfigValueView?>
{
	public async Task<ConfigValueView?> HandleAsync(Query query, CancellationToken ct)
	{
		var project = await projects.GetByIdAsync(query.ProjectId, ct)
			?? throw new ProjectNotFoundException(query.ProjectId);

		await authorization.EnsureCanAccessAsync(new ReadProject(), project, ct);
		
		if (!project.TryGetEnvironment(query.EnvironmentName, out var environment))
			throw new EnvironmentNotFoundException(query.EnvironmentName);

		
		var configuration = await configurations.GetByIdAndProjectAsync(query.ProjectId, query.ConfigItemId, ct)
			?? throw new ConfigItemNotFoundException(query.ConfigItemId);

		if (!configuration.TryGetValue(environment.Id, out var value))
			return null;


		var decrypted = encryption.DecryptSecret(value.Value, project.CurrentDataKey.Value);
		return new ConfigValueView(decrypted, value.LastModifiedAt);
	}
}
