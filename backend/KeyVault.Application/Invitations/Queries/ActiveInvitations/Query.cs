using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.Invitations.Queries.ActiveInvitations;

public sealed record Query(Guid ProjectId) : IQuery<IReadOnlyList<ActiveInvitationView>>;