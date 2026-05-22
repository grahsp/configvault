using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.ConfigItems.BatchExecution;
using KeyVault.Application.ConfigItems.BatchExecution.Models;
using KeyVault.Application.ConfigItems.BatchExecution.Operations;
using KeyVault.Application.ConfigItems.BatchExecution.Planning;
using KeyVault.Application.Projects;
using KeyVault.Application.Projects.Exceptions;

namespace KeyVault.Application.ConfigItems.Commands;

public sealed record SetConfigValueCommand(
	Guid ProjectId,
	Guid ConfigItemId,
	string EnvironmentName,
	string Value,
	uint ExpectedRevision) : ICommand<Unit>;

public sealed class SetConfigValueCommandHandler(
	IProjectRepository projects,
	IProjectAuthorizationService authorization,
	IConfigItemBatchPlanner planner,
	IConfigItemMutationExecutor executor)
	: ICommandHandler<SetConfigValueCommand, Unit>
{
	public async Task<Unit> HandleAsync(SetConfigValueCommand command, CancellationToken ct)
	{
		var project = await projects.GetByIdAsync(command.ProjectId, ct)
			?? throw new ProjectNotFoundException(command.ProjectId);

		var batch = new OperationBatch(
			[new SetValue(command.ConfigItemId, command.Value, command.ExpectedRevision)],
			command.EnvironmentName);

		authorization.EnsureCanAccess(
			ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Write),
			project);

		var prepared = await planner.PrepareAsync(project, batch, ct);
		await executor.ExecuteAsync(prepared, ct);

		return Unit.Value;
	}
}
