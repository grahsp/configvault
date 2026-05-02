using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.Invitations.Commands.AcceptInvitation;

public sealed record Command(string InvitationToken) : ICommand<Response>;

public sealed record Response(Guid ProjectId);
