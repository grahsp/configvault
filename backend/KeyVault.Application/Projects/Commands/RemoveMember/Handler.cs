using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.Exceptions;

namespace KeyVault.Application.Projects.Commands.RemoveMember;

public class Handler(IUserContext user, IProjectRepository repository, IUnitOfWork uow) : ICommandHandler<Command, Unit>
{
	public async Task<Unit> HandleAsync(Command command, CancellationToken ct)
	{
		if (command.UserId == user.UserId)
			throw new BusinessRuleViolationException("Cannot remove yourself from a project");
		
		var project = await repository.GetByIdAsync(command.ProjectId, ct)
		    ?? throw new ProjectNotFoundException(command.ProjectId);
		
		project.RemoveMember(user.UserId, command.UserId);
		await uow.SaveChangesAsync(ct);
		
		return Unit.Value;
	}
}