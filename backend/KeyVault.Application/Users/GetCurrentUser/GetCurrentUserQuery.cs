using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.Users.GetCurrentUser;

public sealed record GetCurrentUserQuery : IQuery<UserView?>;