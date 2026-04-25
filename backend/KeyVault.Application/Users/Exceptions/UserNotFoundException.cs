using KeyVault.Application.Exceptions;

namespace KeyVault.Application.Users.Exceptions;

public class UserNotFoundException(Guid id) : NotFoundException
{
	public Guid Id { get; } = id;
}