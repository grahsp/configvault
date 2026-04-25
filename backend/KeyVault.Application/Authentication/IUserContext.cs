using KeyVault.Domain.Users;

namespace KeyVault.Application.Authentication;

public interface IUserContext : IActorContext
{
	Guid UserId { get; }
	UserStatus Status { get; }
	bool IsActive { get; }
	bool IsAuthenticated { get; }
}