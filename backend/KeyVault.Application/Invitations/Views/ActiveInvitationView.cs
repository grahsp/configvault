namespace KeyVault.Application.Invitations.Views;

public sealed record ActiveInvitationView(Guid InvitationId, Guid CreatedById, string CreatedByName, DateTimeOffset CreatedAt, DateTimeOffset ExpiresAt);
