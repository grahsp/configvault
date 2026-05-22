using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.ConfigItems.BatchExecution;
using KeyVault.Application.ConfigItems.BatchExecution.Models;
using KeyVault.Application.ConfigItems.BatchExecution.Operations;
using KeyVault.Application.ConfigItems.BatchExecution.Planning;
using KeyVault.Application.Projects;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.ConfigItems;

namespace KeyVault.Application.ConfigItems.Commands;

public sealed record RenameConfigItemCommand(Guid ProjectId, Guid ConfigItemId, ConfigKey Key) : ICommand<Unit>;

public sealed class RenameConfigItemCommandHandler(
	IProjectRepository projects,
	IProjectAuthorizationService authorization,
	IConfigItemBatchPlanner planner,
	IConfigItemMutationExecutor executor)
	: ICommandHandler<RenameConfigItemCommand, Unit>
{
	public async Task<Unit> HandleAsync(RenameConfigItemCommand command, CancellationToken ct)
	{
		var project = await projects.GetByIdAsync(command.ProjectId, ct)
			?? throw new ProjectNotFoundException(command.ProjectId);

		var batch = new OperationBatch([new RenameItem(command.ConfigItemId, command.Key)]);

		authorization.EnsureCanAccess(
			ProjectCapability.Create(ProjectResource.ConfigItem, ProjectPermission.Manage),
			project);

		var prepared = await planner.PrepareAsync(project, batch, ct);
		await executor.ExecuteAsync(prepared, ct);

		return Unit.Value;
	}
}
