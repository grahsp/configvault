using KeyVault.Domain.Users;

namespace KeyVault.Application.Authentication;

public interface ICurrentUser
{
	Guid UserId { get; }
	UserStatus Status { get; }
	bool IsActive { get; }
	bool IsAuthenticated { get; }
}