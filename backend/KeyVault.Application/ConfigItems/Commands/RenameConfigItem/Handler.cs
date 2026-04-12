using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.ConfigItems.Exceptions;
using KeyVault.Application.ConfigItems.Views;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.ConfigItems.Commands.RenameConfigItem;

public class Handler(
	IUserContext user,
	IProjectRepository projects,
	IConfigItemRepository configurations,
	IUnitOfWork uow)
	: ICommandHandler<Command, ConfigItemSummary>
{
	public async Task<ConfigItemSummary> HandleAsync(Command command, CancellationToken ct)
	{
		var project = await projects.GetByIdAsync(command.ProjectId, ct)
		    ?? throw new ProjectNotFoundException(command.ProjectId);

		project.RequireMemberWithRole(user.UserId, ProjectRole.Admin);

		var configItem = await configurations.GetByIdAsync(command.ConfigItemId, ct)
			?? throw new ConfigItemNotFoundException(command.ConfigItemId);
		
		configItem.SetKey(command.Key);
		await uow.SaveChangesAsync(ct);

		return new ConfigItemSummary(configItem.Id, configItem.Key.Value);
	}
}