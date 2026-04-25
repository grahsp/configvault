using KeyVault.Domain.Users;

namespace KeyVault.Application.Authentication;

// TODO: remove once IActorContext has been implemented everywhere
public interface IUserContext : IActorContext
{
	Guid UserId { get; }
	UserStatus Status { get; }
	bool IsActive { get; }
	bool IsAuthenticated { get; }
}