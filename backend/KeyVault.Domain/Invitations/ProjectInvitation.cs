using System.ComponentModel.DataAnnotations;
using KeyVault.Domain.Identity;

namespace KeyVault.Domain.Invitations;

public class ProjectInvitation
{
	public Guid Id { get; }
	public Guid ProjectId { get; private init; }

	[Timestamp] public byte[] RowVersion { get; private set; } = null!;

	public InvitationTokenHash TokenHash { get; private init; }

	public UserId CreatedBy { get; private init; }
	public DateTimeOffset CreatedAt { get; private init; }
	public DateTimeOffset ExpiresAt { get; private init; }
	
	public UserId? AcceptedBy { get; private set; }
	public DateTimeOffset? AcceptedAt { get; private set; }
	
	public UserId? RevokedBy { get; private set; }
	public DateTimeOffset? RevokedAt { get; private set; }

	private ProjectInvitation() { }

	public ProjectInvitation(
		Guid projectId,
		InvitationTokenHash tokenHash,
		UserId actor,
		DateTimeOffset now,
		TimeSpan lifetime)
	{
		Id = Guid.NewGuid();
		ProjectId = projectId;
		TokenHash = tokenHash;
		CreatedBy = actor;
		CreatedAt = now;
		ExpiresAt = now + lifetime;
	}

	public static ProjectInvitation Create(
		Guid projectId,
		InvitationTokenHash tokenHash,
		UserId actor,
		DateTimeOffset now,
		TimeSpan lifetime)
	{
		return new ProjectInvitation(projectId, tokenHash, actor, now, lifetime);
	}
	
	public InvitationStatus Status(DateTimeOffset now)
	{
		if (RevokedAt.HasValue)
			return InvitationStatus.Revoked;
			
		if (AcceptedAt.HasValue)
			return InvitationStatus.Accepted;
			
		if (ExpiresAt < now)
			return InvitationStatus.Expired;
			
		return InvitationStatus.Pending;
	}
	
	public void Accept(UserId actor, DateTimeOffset now)
	{
		if (AcceptedAt.HasValue)
			throw new InvitationAlreadyAcceptedException();

		if (RevokedAt.HasValue)
			throw new InvitationRevokedException();

		if (ExpiresAt <= now)
			throw new InvitationExpiredException();

		AcceptedAt = now;
		AcceptedBy = actor;
	}

	public void Revoke(UserId actor, DateTimeOffset now)
	{
		if (AcceptedAt.HasValue)
			throw new InvitationAlreadyAcceptedException();

		if (ExpiresAt <= now)
			throw new InvitationExpiredException();

		if (RevokedAt.HasValue)
			return;

		RevokedAt = now;
		RevokedBy = actor;
	}
}