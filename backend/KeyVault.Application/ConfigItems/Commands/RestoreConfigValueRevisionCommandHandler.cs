using KeyVault.Application.Abstractions.Cryptography;
using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.ConfigItems.BatchExecution;
using KeyVault.Application.ConfigItems.BatchExecution.Models;
using KeyVault.Application.ConfigItems.BatchExecution.Operations;
using KeyVault.Application.ConfigItems.BatchExecution.Planning;
using KeyVault.Application.ConfigItems.Exceptions;
using KeyVault.Application.Projects;
using KeyVault.Application.Projects.Exceptions;

namespace KeyVault.Application.ConfigItems.Commands;

public sealed record RestoreConfigValueRevisionCommand(
	Guid ProjectId,
	Guid ConfigItemId,
	string EnvironmentName,
	uint Revision,
	uint ExpectedRevision) : ICommand<Unit>;

public sealed class RestoreConfigValueRevisionCommandHandler(
	IProjectRepository projects,
	IConfigItemRepository configurations,
	IProjectAuthorizationService authorization,
	IEnvelopeEncryptionService encryption,
	IConfigItemBatchPlanner planner,
	IConfigItemMutationExecutor executor)
	: ICommandHandler<RestoreConfigValueRevisionCommand, Unit>
{
	public async Task<Unit> HandleAsync(RestoreConfigValueRevisionCommand command, CancellationToken ct)
	{
		var project = await projects.GetByIdAsync(command.ProjectId, ct)
			?? throw new ProjectNotFoundException(command.ProjectId);

		authorization.EnsureCanAccess(
			ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Write),
			project);

		if (!project.TryGetEnvironment(command.EnvironmentName, out var environment))
			throw new EnvironmentNotFoundException(command.EnvironmentName);

		var configItem = await configurations.GetByIdAndProjectAsync(command.ProjectId, command.ConfigItemId, ct)
			?? throw new ConfigItemNotFoundException(command.ConfigItemId);

		var revision = configItem.Values
			.SingleOrDefault(value => value.EnvironmentId == environment.Id)?
			.Revisions
			.SingleOrDefault(revision => revision.Revision == command.Revision)
			?? throw new ConfigValueRevisionNotFoundException(command.ConfigItemId, command.Revision);

		var restoredValue = encryption.DecryptSecret(revision.Value, project.CurrentDataKey.Value);
		var batch = new OperationBatch(
			[new SetValue(configItem.Id, restoredValue, command.ExpectedRevision)],
			command.EnvironmentName);

		var prepared = await planner.PrepareAsync(project, batch, ct);
		await executor.ExecuteAsync(prepared, ct);

		return Unit.Value;
	}
}
