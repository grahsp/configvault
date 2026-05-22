using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.ConfigItems.BatchExecution;
using KeyVault.Application.ConfigItems.BatchExecution.Models;
using KeyVault.Application.ConfigItems.BatchExecution.Operations;
using KeyVault.Application.ConfigItems.BatchExecution.Planning;
using KeyVault.Application.ConfigItems.Queries;
using KeyVault.Application.Projects;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.ConfigItems;

namespace KeyVault.Application.ConfigItems.Commands;

public sealed record CreateImportedItemsCommand(
	Guid ProjectId,
	string EnvironmentName,
	IEnumerable<ConfigKeyValue> KeyValues) : ICommand<Unit>;

public sealed class CreateImportedItemsCommandHandler(
	IProjectAuthorizationService authorization,
	IProjectRepository projects,
	IConfigItemBatchPlanner planner,
	IConfigItemMutationExecutor executor)
	: ICommandHandler<CreateImportedItemsCommand, Unit>
{
	public async Task<Unit> HandleAsync(CreateImportedItemsCommand command, CancellationToken ct)
	{
		var project = await projects.GetByIdAsync(command.ProjectId, ct)
			?? throw new ProjectNotFoundException(command.ProjectId);

		authorization.EnsureCanAccess(
			ProjectCapability.Create(ProjectResource.ConfigItem, ProjectPermission.Write),
			project);

		var operations = command.KeyValues
			.Select(kvp => new CreateItem(ConfigKey.Create(kvp.Key), kvp.Value));

		var batch = new OperationBatch(operations, command.EnvironmentName);

		var prepared = await planner.PrepareAsync(project, batch, ct);
		await executor.ExecuteAsync(prepared, ct);

		return Unit.Value;
	}
}
