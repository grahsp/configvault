using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Authorization;
using KeyVault.Application.ConfigItems.BatchExecution;
using KeyVault.Application.ConfigItems.BatchExecution.Models;
using KeyVault.Application.ConfigItems.BatchExecution.Planning;
using KeyVault.Application.Projects;
using KeyVault.Application.Projects.Exceptions;

namespace KeyVault.Application.ConfigItems.Commands.RenameConfigItem;

public sealed class Handler(
	IProjectRepository projects,
	IActorContext actor,
	IActorAuthorizationService authorization,
	IConfigItemOperationAuthorizer operationAuthorizer,
	IConfigItemBatchPlanner planner,
	IConfigItemMutationExecutor executor)
	: ICommandHandler<Command, Unit>
{
	public async Task<Unit> HandleAsync(Command command, CancellationToken ct)
	{
		var project = await projects.GetByIdAsync(command.ProjectId, ct)
		              ?? throw new ProjectNotFoundException(command.ProjectId);
		
		var batch = new OperationBatch([new RenameItem(command.ConfigItemId, command.Key)]);
		
		authorization.EnsureCanAccessProject(project, actor);
		operationAuthorizer.Authorize(actor, project, batch);

		var prepared = await planner.PrepareAsync(actor, project, batch, ct);
		await executor.ExecuteAsync(prepared, ct);
		
		return Unit.Value;
	}
}
