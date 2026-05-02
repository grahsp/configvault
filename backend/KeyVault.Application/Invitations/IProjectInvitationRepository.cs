using KeyVault.Domain.Invitations;

namespace KeyVault.Application.Invitations;

public interface IProjectInvitationRepository
{
	Task<ProjectInvitation?> GetByIdAsync(Guid invitationId, CancellationToken ct);
	Task<ProjectInvitation?> GetByTokenAsync(InvitationTokenHash tokenHash, CancellationToken ct);
	void Add(ProjectInvitation invitation);
	void Remove(ProjectInvitation invitation);
}