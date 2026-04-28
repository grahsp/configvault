using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.ConfigItems.BatchExecution;
using KeyVault.Application.ConfigItems.BatchExecution.Models;
using KeyVault.Application.ConfigItems.BatchExecution.Planning;
using KeyVault.Application.Projects;
using KeyVault.Application.Projects.Exceptions;

namespace KeyVault.Application.ConfigItems.Commands.BatchOperations;

public sealed class Handler(
	IProjectRepository projects,
	IActorContext actor,
	IProjectAuthorizationService authorization,
	IConfigItemBatchPlanner planner,
	IConfigItemMutationExecutor executor)
	: ICommandHandler<Command, Unit>
{
	public async Task<Unit> HandleAsync(Command command, CancellationToken ct)
	{
		var project = await projects.GetByIdAsync(command.ProjectId, ct)
		              ?? throw new ProjectNotFoundException(command.ProjectId);

		foreach (var capability in RequiredCapabilitiesFor(command.Batch))
			await authorization.EnsureCanAccessAsync(capability, project, ct);

		var prepared = await planner.PrepareAsync(actor, project, command.Batch, ct);
		await executor.ExecuteAsync(prepared, ct);
		
		return Unit.Value;
	}

	private static IReadOnlyList<ProjectCapability> RequiredCapabilitiesFor(OperationBatch batch)
		=> batch.Operations
			.SelectMany(operation => operation.RequiredCapabilities)
			.Distinct()
			.ToArray();
}
