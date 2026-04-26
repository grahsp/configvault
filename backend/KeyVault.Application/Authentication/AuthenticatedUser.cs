using KeyVault.Domain.Actors;
using KeyVault.Domain.Users;

namespace KeyVault.Application.Authentication;

public sealed record AuthenticatedUser(ActorId Id, UserStatus Status);