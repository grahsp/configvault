using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Invitations.Queries.ActiveInvitations;

public class Handler(
	IReadDbContext db,
	IProjectAuthorizationService authorization,
	TimeProvider time)
	: IQueryHandler<Query, IReadOnlyList<ActiveInvitationView>>
{
	public async Task<IReadOnlyList<ActiveInvitationView>> HandleAsync(Query query, CancellationToken ct)
	{
		await authorization.EnsureCanAccessAsync(
			ProjectCapability.Create(ProjectResource.Invitation, ProjectPermission.Read),
			query.ProjectId,
			ct);

		return await db.Invitations
			.Where(i => i.ProjectId == query.ProjectId)
			.Active(time.GetUtcNow())
			.Join(
				db.Users,
				i => i.CreatedBy,
				u => u.Id,
				(i, u) => new ActiveInvitationView(
					i.Id,
					u.Id.Value,
					u.DisplayName,
					i.CreatedAt,
					i.ExpiresAt))
			.ToListAsync(ct);
	}
}