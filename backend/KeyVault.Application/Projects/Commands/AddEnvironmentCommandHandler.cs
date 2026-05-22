using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Projects.Commands;

public sealed record AddEnvironmentCommand(Guid ProjectId, string EnvironmentName) : ICommand<AddEnvironmentResponse>;
public sealed record AddEnvironmentResponse(Guid Id, string EnvironmentName);

public sealed class AddEnvironmentCommandHandler(
	IProjectAuthorizationService authorization,
	IProjectRepository repository,
	IUnitOfWork uow,
	TimeProvider time)
	: ICommandHandler<AddEnvironmentCommand, AddEnvironmentResponse>
{
	public async Task<AddEnvironmentResponse> HandleAsync(AddEnvironmentCommand command, CancellationToken ct)
	{
		var project = await repository.GetByIdAsync(command.ProjectId, ct)
			?? throw new ProjectNotFoundException(command.ProjectId);

		authorization.EnsureCanAccess(
			ProjectCapability.Create(ProjectResource.Environment, ProjectPermission.Manage),
			project);

		var environment = project.AddEnvironment(command.EnvironmentName, time.GetUtcNow());
		await uow.SaveChangesAsync(ct);

		return new AddEnvironmentResponse(environment.Id, environment.Name);
	}
}
