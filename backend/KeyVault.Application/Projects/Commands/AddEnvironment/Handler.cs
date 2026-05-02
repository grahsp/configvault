using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Application.Projects.Queries.GetEnvironments;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Projects.Commands.AddEnvironment;

public sealed class Handler(
	IProjectAuthorizationService authorization,
	IProjectRepository repository,
	IUnitOfWork uow,
	TimeProvider time)
	: ICommandHandler<Command, Response>
{
	public async Task<Response> HandleAsync(Command command, CancellationToken ct)
	{
		var project = await repository.GetByIdAsync(command.ProjectId, ct)
			?? throw new ProjectNotFoundException(command.ProjectId);

		authorization.EnsureCanAccess(
			ProjectCapability.Create(ProjectResource.Environment, ProjectPermission.Manage),
			project);
		
		var environment = project.AddEnvironment(command.EnvironmentName, time.GetUtcNow());
		await uow.SaveChangesAsync(ct);

		return new Response(environment.Id, environment.Name);
	}
}
