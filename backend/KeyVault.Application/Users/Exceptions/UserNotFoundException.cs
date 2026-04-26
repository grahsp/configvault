using KeyVault.Application.Exceptions;
using KeyVault.Domain.Actors;

namespace KeyVault.Application.Users.Exceptions;

public class UserNotFoundException(ActorId id) : NotFoundException
{
	public ActorId Id { get; } = id;
}