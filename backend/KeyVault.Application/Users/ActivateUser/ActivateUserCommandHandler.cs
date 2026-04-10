using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authentication;
using KeyVault.Application.Persistence;

namespace KeyVault.Application.Users.ActivateUser;

public class ActivateUserCommandHandler(
	IUserContext userContext,
	IUserRepository repository,
	IUnitOfWork persistence,
	TimeProvider time)
	: ICommandHandler<ActivateUserCommand, Unit>
{
	public async Task<Unit> HandleAsync(ActivateUserCommand command, CancellationToken ct)
	{
		var user = await repository.GetByIdAsync(userContext.UserId, ct)
			?? throw new InvalidOperationException("User not found");

		user.Activate(command.DisplayName, time.GetUtcNow());
		await persistence.SaveChangesAsync(ct);

		return Unit.Value;
	}
}