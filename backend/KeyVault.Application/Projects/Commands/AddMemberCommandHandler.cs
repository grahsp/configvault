using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.Exceptions;
using KeyVault.Domain.Identity;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Projects.Commands;

public sealed record AddMemberCommand(Guid ProjectId, UserId UserId) : ICommand<Unit>;

public sealed class AddMemberCommandHandler(
	IActorContext actor,
	IProjectAuthorizationService authorization,
	IProjectRepository repository,
	IUnitOfWork uow)
	: ICommandHandler<AddMemberCommand, Unit>
{
	public async Task<Unit> HandleAsync(AddMemberCommand command, CancellationToken ct)
	{
		if (actor.TryGetUserId(out var userId) && command.UserId == userId)
			throw new BusinessRuleViolationException("Cannot add yourself to a project");

		var project = await repository.GetByIdAsync(command.ProjectId, ct)
			?? throw new ProjectNotFoundException(command.ProjectId);

		authorization.EnsureCanAccess(
			ProjectCapability.Create(ProjectResource.ProjectMember, ProjectPermission.Manage),
			project);

		project.AddMember(command.UserId, ProjectRole.Member);
		await uow.SaveChangesAsync(ct);

		return Unit.Value;
	}
}
