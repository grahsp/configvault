using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.Persistence;

namespace KeyVault.Application.Users.ActivateUser;

public class ActivateUserCommandHandler(
	ICurrentUser currentUser,
	IUserRepository repository,
	IUnitOfWork persistence,
	TimeProvider time)
	: ICommandHandler<ActivateUserCommand>
{
	public async Task HandleAsync(ActivateUserCommand command, CancellationToken ct)
	{
		var user = await repository.GetByIdAsync(currentUser.UserId, ct)
			?? throw new InvalidOperationException("User not found");

		user.Activate(command.DisplayName, time.GetUtcNow());
		await persistence.SaveChangesAsync(ct);
	}
}