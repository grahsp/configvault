using KeyVault.Application.Exceptions;
using KeyVault.Domain.Identity;

namespace KeyVault.Application.Users.Exceptions;

public class UserNotFoundException(UserId id) : NotFoundException
{
	public UserId Id { get; } = id;
}
