using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Actors;
using KeyVault.Application.Persistence;
using KeyVault.Application.Users.Exceptions;

namespace KeyVault.Application.Users.ActivateUser;

public class ActivateUserCommandHandler(
	IUserContext actor,
	IUserRepository repository,
	IUnitOfWork persistence,
	TimeProvider time)
	: ICommandHandler<ActivateUserCommand, Unit>
{
	public async Task<Unit> HandleAsync(ActivateUserCommand command, CancellationToken ct)
	{
		var user = await repository.GetByIdAsync(actor.Id, ct)
			?? throw new UserNotFoundException(actor.Id);

		user.Activate(command.DisplayName, time.GetUtcNow());
		await persistence.SaveChangesAsync(ct);

		return Unit.Value;
	}
}