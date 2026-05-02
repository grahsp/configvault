using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.Invitations.Commands.CreateInvitation;

public sealed record Command(Guid ProjectId) : ICommand<string>;