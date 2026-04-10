using KeyVault.Domain.Users;

namespace KeyVault.Application.Authentication;

public sealed record AuthenticatedUser(Guid Id, UserStatus Status);