using KeyVault.Domain.Users;
using KeyVault.Domain.Identity;

namespace KeyVault.Application.Authentication;

public sealed record AuthenticatedUser(UserId Id, UserStatus Status, string Issuer, string Subject);
