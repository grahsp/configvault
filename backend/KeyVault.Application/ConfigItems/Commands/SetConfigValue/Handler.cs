using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.ConfigItems.BatchExecution;
using KeyVault.Application.ConfigItems.BatchExecution.Models;
using KeyVault.Application.ConfigItems.BatchExecution.Operations;
using KeyVault.Application.ConfigItems.BatchExecution.Planning;
using KeyVault.Application.Projects;
using KeyVault.Application.Projects.Exceptions;

namespace KeyVault.Application.ConfigItems.Commands.SetConfigValue;

public sealed class Handler(
	IProjectRepository projects,
	IProjectAuthorizationService authorization,
	IConfigItemBatchPlanner planner,
	IConfigItemMutationExecutor executor)
	: ICommandHandler<Command, Unit>
{
	public async Task<Unit> HandleAsync(Command command, CancellationToken ct)
	{
		var project = await projects.GetByIdAsync(command.ProjectId, ct)
		              ?? throw new ProjectNotFoundException(command.ProjectId);
		
		var batch = new OperationBatch(
			[new SetValue(command.ConfigItemId, command.Value)],
			command.EnvironmentName);

		authorization.EnsureCanAccess(
			ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Write),
			project);

		var prepared = await planner.PrepareAsync(project, batch, ct);
		await executor.ExecuteAsync(prepared, ct);
		
		return Unit.Value;
	}
}
