using KeyVault.Application.Abstractions.Cryptography;
using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Persistence;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Projects.Commands;

public sealed record CreateProjectCommand(string Name) : ICommand<Guid>;

public sealed class CreateProjectCommandHandler(
	IActorContext actor,
	IProjectRepository repository,
	IUnitOfWork uow,
	TimeProvider time,
	IEnvelopeEncryptionService encryption)
	: ICommandHandler<CreateProjectCommand, Guid>
{
	public async Task<Guid> HandleAsync(CreateProjectCommand command, CancellationToken ct)
	{
		var encryptedDataKey = encryption.GenerateDataKey();
		var project = Project.Create(actor.RequireUserId(), command.Name, encryptedDataKey, time.GetUtcNow());

		repository.Add(project);
		await uow.SaveChangesAsync(ct);

		return project.Id;
	}
}
