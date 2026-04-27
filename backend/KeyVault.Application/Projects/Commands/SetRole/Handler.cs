using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects.Exceptions;

namespace KeyVault.Application.Projects.Commands.SetRole;

public class Handler(IActorContext actor, IProjectRepository repository, IUnitOfWork uow)
	: ICommandHandler<Command, Unit>
{
	public async Task<Unit> HandleAsync(Command command, CancellationToken ct)
	{
		var project = await repository.GetByIdAsync(command.ProjectId, ct)
			?? throw new ProjectNotFoundException(command.ProjectId);
		
		project.SetRole(actor.Id, command.TargetActorId, command.Role);
		await uow.SaveChangesAsync(ct);
		
		return Unit.Value;
	}
}