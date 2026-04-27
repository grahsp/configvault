using KeyVault.Domain.Users;

namespace KeyVault.Application.Actors;

public interface IUserContext : IActorContext
{
	UserStatus Status { get; }
	bool IsActive { get; }
}