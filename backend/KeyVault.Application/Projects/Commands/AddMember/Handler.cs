using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.Exceptions;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Projects.Commands.AddMember;

public class Handler(IUserContext actor, IProjectRepository repository, IUnitOfWork uow) : ICommandHandler<Command, Unit>
{
	public async Task<Unit> HandleAsync(Command command, CancellationToken ct)
	{
		if (command.UserId == actor.Id)
			throw new BusinessRuleViolationException("Cannot add yourself to a project");
		
		var project = await repository.GetByIdAsync(command.ProjectId, ct)
			?? throw new ProjectNotFoundException(command.ProjectId);
		
		project.AddMember(actor.Id, command.UserId, ProjectRole.Member);
		await uow.SaveChangesAsync(ct);

		return Unit.Value;
	}
}