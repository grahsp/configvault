using KeyVault.Application.Abstractions.Cryptography;
using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.ConfigItems.Exceptions;
using KeyVault.Application.Exceptions;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects;
using KeyVault.Application.Projects.Exceptions;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.ConfigItems.Commands.SetConfigValue;

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
		var configuration = await configurations.GetByIdAsync(command.ConfigItemId, ct)
		                    ?? throw new ConfigItemNotFoundException(command.ConfigItemId);
		
		if (configuration.ProjectId != command.ProjectId)
			throw new ConfigItemNotFoundException(command.ConfigItemId);
		
		var project = await projects.GetByIdAsync(configuration.ProjectId, ct)
		              ?? throw new ProjectNotFoundException(configuration.ProjectId);
		
		if (!project.TryGetEnvironment(command.EnvironmentName, out var environment))
			throw new EnvironmentNotFound(command.EnvironmentName);

		project.RequireMemberWithRole(user.UserId, ProjectRole.Admin);
		
		var encryptedValue = encryption.EncryptSecret(command.Value, project.CurrentDataKey.Value);
		configuration.SetValue(environment.Id, encryptedValue, user.UserId, time.GetUtcNow());
		await uow.SaveChangesAsync(ct);
		
		return Unit.Value;
	}
}

public sealed class EnvironmentNotFound : NotFoundException
{
	public EnvironmentNotFound(Guid id) : base($"Environment '{id}' not found.") {}
	public EnvironmentNotFound(string name) : base($"Environment '{name}' not found.") {}
}
