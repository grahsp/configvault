using KeyVault.Application.Abstractions.Cryptography;
using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.ConfigItems.Exceptions;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.ConfigItems.Commands.SaveConfigItems;

public sealed class Handler(
	IUserContext user,
	IProjectRepository projects,
	IConfigItemRepository configurations,
	IUnitOfWork uow,
	TimeProvider time,
	IEnvelopeEncryptionService encryption)
	: ICommandHandler<Command, Unit>
{
	public async Task<Unit> HandleAsync(Command command, CancellationToken ct)
	{
		var project = await projects.GetByIdAsync(command.ProjectId, ct)
			?? throw new ProjectNotFoundException(command.ProjectId);

		project.RequireMemberWithRole(user.UserId, ProjectRole.Admin);

		if (!project.TryGetEnvironment(command.EnvironmentName, out var environment))
			throw new EnvironmentNotFoundException(command.EnvironmentName);

		var pendingDeleteIds = command.DeleteConfigItemIds.ToHashSet();

		foreach (var update in command.Updates.Where(update => !pendingDeleteIds.Contains(update.ConfigItemId)))
		{
			var configItem = await configurations.GetByIdAsync(update.ConfigItemId, ct)
				?? throw new ConfigItemNotFoundException(update.ConfigItemId);

			if (configItem.ProjectId != command.ProjectId)
				throw new ConfigItemNotFoundException(update.ConfigItemId);

			if (update.Key is not null)
				configItem.SetKey(update.Key);

			if (update.Value is not null)
			{
				var encryptedValue = encryption.EncryptSecret(update.Value, project.CurrentDataKey.Value);
				configItem.SetValue(environment.Id, encryptedValue, user.UserId, time.GetUtcNow());
			}
		}

		foreach (var configItemId in pendingDeleteIds)
		{
			var configItem = await configurations.GetByIdAsync(configItemId, ct);

			if (configItem is null || configItem.ProjectId != command.ProjectId)
				continue;

			configurations.Remove(configItem);
		}

		await uow.SaveChangesAsync(ct);

		return Unit.Value;
	}
}
