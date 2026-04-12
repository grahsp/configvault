using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.ConfigItems.Commands.RemoveConfigItem;

public class Handler(
	IUserContext user,
	IProjectRepository projects,
	IConfigItemRepository configurations,
	IUnitOfWork uow)
	: ICommandHandler<Command, Unit>
{
	public async Task<Unit> HandleAsync(Command command, CancellationToken ct)
	{
		var project = await projects.GetByIdAsync(command.ProjectId, ct)
		    ?? throw new ProjectNotFoundException(command.ProjectId);

		project.RequireMemberWithRole(user.UserId, ProjectRole.Admin);

		var configItem = await configurations.GetByIdAsync(command.ConfigItemId, ct);

		if (configItem is null)
			return Unit.Value;

		if (configItem.ProjectId != command.ProjectId)
			return Unit.Value;
		
		configurations.Remove(configItem);
		await uow.SaveChangesAsync(ct);
		
		return Unit.Value;
	}
}