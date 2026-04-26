using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.Authorization;
using KeyVault.Application.ConfigItems.BatchExecution;
using KeyVault.Application.ConfigItems.BatchExecution.Planning;
using KeyVault.Application.Projects;
using KeyVault.Application.Projects.Exceptions;

namespace KeyVault.Application.ConfigItems.Commands.BatchOperations;

public sealed class Handler(
	IProjectRepository projects,
	IUserContext actor,
	IActorAuthorizationService authorization,
	IConfigItemOperationAuthorizer authorizer,
	IConfigItemBatchPlanner planner,
	IConfigItemMutationExecutor executor)
	: ICommandHandler<Command, Unit>
{
	public async Task<Unit> HandleAsync(Command command, CancellationToken ct)
	{
		var project = await projects.GetByIdAsync(command.ProjectId, ct)
		              ?? throw new ProjectNotFoundException(command.ProjectId);
		
		authorization.EnsureCanAccessProject(project, actor);
		authorizer.Authorize(actor, project, command.Batch);

		var prepared = await planner.PrepareAsync(actor, project, command.Batch, ct);
		await executor.ExecuteAsync(prepared, ct);
		
		return Unit.Value;
	}
}
