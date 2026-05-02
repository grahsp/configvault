using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.Invitations.Commands.RevokeInvitation;

public sealed record Command(Guid ProjectId, Guid InvitationId) : ICommand<Unit>;