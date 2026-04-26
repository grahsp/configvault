using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Application.Projects.Queries.GetEnvironments;

namespace KeyVault.Application.Projects.Commands.AddEnvironment;

public sealed class Handler(
	IUserContext actor,
	IProjectRepository repository,
	IUnitOfWork uow,
	TimeProvider time)
	: ICommandHandler<Command, Response>
{
	public async Task<Response> HandleAsync(Command command, CancellationToken ct)
	{
		var project = await repository.GetByIdAsync(command.ProjectId, ct)
			?? throw new ProjectNotFoundException(command.ProjectId);

		var environment = project.AddEnvironment(actor.Id, command.EnvironmentName, time.GetUtcNow());
		await uow.SaveChangesAsync(ct);

		return new Response(environment.Id, environment.Name);
	}
}