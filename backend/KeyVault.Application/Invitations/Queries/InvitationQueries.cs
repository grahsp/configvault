using KeyVault.Domain.Invitations;

namespace KeyVault.Application.Invitations.Queries;

public static class InvitationQueries
{
	public static IQueryable<ProjectInvitation> Active(this IQueryable<ProjectInvitation> query, DateTimeOffset now)
	{
		return query.Where(i =>
			i.ExpiresAt > now &&
			i.RevokedAt == null &&
			i.AcceptedAt == null);
	}
}
