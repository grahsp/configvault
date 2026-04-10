using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.Persistence;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Projects.Commands.CreateProject;

public sealed class Handler(IUserContext user, IProjectRepository repository, IUnitOfWork uow, TimeProvider time)
	: ICommandHandler<Command, Guid>
{
	public async Task<Guid> HandleAsync(Command command, CancellationToken ct)
	{
		var project = Project.Create(user.UserId, command.Name, time.GetUtcNow());
		
		repository.Add(project);
		await uow.SaveChangesAsync(ct);

		return project.Id;
	}
}