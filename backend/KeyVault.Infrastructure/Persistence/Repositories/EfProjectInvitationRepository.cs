using KeyVault.Application.Invitations;
using KeyVault.Domain.Invitations;
using Microsoft.EntityFrameworkCore;

namespace KeyVault.Infrastructure.Persistence.Repositories;

public class EfProjectInvitationRepository(AppDbContext db) : IProjectInvitationRepository
{
	public async Task<ProjectInvitation?> GetByTokenAsync(InvitationTokenHash tokenHash, CancellationToken ct)
	{
		return await db.Invitations
			.Where(i => i.TokenHash == tokenHash)
			.SingleOrDefaultAsync(ct);
	}
	
	public void Add(ProjectInvitation invitation)
		=> db.Invitations.Add(invitation);
	
	public void Remove(ProjectInvitation invitation)
		=> db.Invitations.Remove(invitation);
}