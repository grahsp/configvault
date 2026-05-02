namespace KeyVault.Application.Invitations.Queries.ActiveInvitations;

public sealed record ActiveInvitationView(Guid InvitationId, Guid CreatedById, string CreatedByName, DateTimeOffset CreatedAt, DateTimeOffset ExpiresAt);