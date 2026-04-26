using KeyVault.Domain.Users;

namespace KeyVault.Application.Authentication;

public interface IUserContext : IActorContext
{
	UserStatus Status { get; }
	bool IsActive { get; }
}