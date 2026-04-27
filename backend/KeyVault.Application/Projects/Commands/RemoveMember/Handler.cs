using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.Exceptions;

namespace KeyVault.Application.Projects.Commands.RemoveMember;

public class Handler(IActorContext actor, IProjectRepository repository, IUnitOfWork uow) : ICommandHandler<Command, Unit>
{
	public async Task<Unit> HandleAsync(Command command, CancellationToken ct)
	{
		if (command.TargetActorId == actor.Id)
			throw new BusinessRuleViolationException("Cannot remove yourself from a project");
		
		var project = await repository.GetByIdAsync(command.ProjectId, ct)
		    ?? throw new ProjectNotFoundException(command.ProjectId);
		
		project.RemoveMember(actor.Id, command.TargetActorId);
		await uow.SaveChangesAsync(ct);
		
		return Unit.Value;
	}
}