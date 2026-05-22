using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.Identity;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Projects.Commands;

public sealed record SetRoleCommand(Guid ProjectId, UserId TargetUserId, ProjectRole Role) : ICommand<Unit>;

public sealed class SetRoleCommandHandler(
	IProjectAuthorizationService authorization,
	IProjectRepository repository,
	IUnitOfWork uow)
	: ICommandHandler<SetRoleCommand, Unit>
{
	public async Task<Unit> HandleAsync(SetRoleCommand command, CancellationToken ct)
	{
		var project = await repository.GetByIdAsync(command.ProjectId, ct)
			?? throw new ProjectNotFoundException(command.ProjectId);

		authorization.EnsureCanAccess(
			ProjectCapability.Create(ProjectResource.ProjectMember, ProjectPermission.Manage),
			project);

		project.SetRole(command.TargetUserId, command.Role);
		await uow.SaveChangesAsync(ct);

		return Unit.Value;
	}
}
