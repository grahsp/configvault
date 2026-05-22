using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.ConfigItems.BatchExecution;
using KeyVault.Application.ConfigItems.BatchExecution.Models;
using KeyVault.Application.ConfigItems.BatchExecution.Planning;
using KeyVault.Application.Projects;
using KeyVault.Application.Projects.Exceptions;

namespace KeyVault.Application.ConfigItems.Commands;

public sealed record ExecuteBatchOperationsCommand(Guid ProjectId, OperationBatch Batch) : ICommand<Unit>;

public sealed class ExecuteBatchOperationsCommandHandler(
	IProjectRepository projects,
	IProjectAuthorizationService authorization,
	IConfigItemBatchPlanner planner,
	IConfigItemMutationExecutor executor)
	: ICommandHandler<ExecuteBatchOperationsCommand, Unit>
{
	public async Task<Unit> HandleAsync(ExecuteBatchOperationsCommand command, CancellationToken ct)
	{
		var project = await projects.GetByIdAsync(command.ProjectId, ct)
			?? throw new ProjectNotFoundException(command.ProjectId);

		foreach (var capability in RequiredCapabilitiesFor(command.Batch))
			authorization.EnsureCanAccess(capability, project);

		var prepared = await planner.PrepareAsync(project, command.Batch, ct);
		await executor.ExecuteAsync(prepared, ct);

		return Unit.Value;
	}

	private static IReadOnlyList<ProjectCapability> RequiredCapabilitiesFor(OperationBatch batch)
		=> batch.Operations
			.SelectMany(operation => operation.RequiredCapabilities)
			.Distinct()
			.ToArray();
}
