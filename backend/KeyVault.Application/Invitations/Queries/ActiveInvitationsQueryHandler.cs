using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.Invitations.Views;
using KeyVault.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Application.Invitations.Queries;

public sealed record ActiveInvitationsQuery(Guid ProjectId) : IQuery<IReadOnlyList<ActiveInvitationView>>;

public sealed class ActiveInvitationsQueryHandler(
	IReadDbContext db,
	IProjectAuthorizationService authorization,
	TimeProvider time)
	: IQueryHandler<ActiveInvitationsQuery, IReadOnlyList<ActiveInvitationView>>
{
	public async Task<IReadOnlyList<ActiveInvitationView>> HandleAsync(ActiveInvitationsQuery query, CancellationToken ct)
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
