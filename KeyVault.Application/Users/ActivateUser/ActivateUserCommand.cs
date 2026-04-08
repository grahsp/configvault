using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.Users.ActivateUser;

public sealed record ActivateUserCommand(string DisplayName) : ICommand;