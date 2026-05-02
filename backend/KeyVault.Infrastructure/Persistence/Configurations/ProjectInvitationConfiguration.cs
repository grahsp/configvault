using KeyVault.Domain.Invitations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KeyVault.Infrastructure.Persistence.Configurations;

public class ProjectInvitationConfiguration : IEntityTypeConfiguration<ProjectInvitation>
{

	public void Configure(EntityTypeBuilder<ProjectInvitation> builder)
	{
		builder.ToTable("project_invitations");
		
		builder.HasKey(x => x.Id);

		builder.HasIndex(x => x.TokenHash)
			.IsUnique();

		builder.Property(x => x.TokenHash)
			.HasConversion(
				hash => hash.Value,
				value => InvitationTokenHash.Create(value))
			.HasMaxLength(128)
			.IsRequired();

		builder.Property(x => x.ProjectId)
			.IsRequired();

		builder.Property(x => x.RowVersion)
			.IsRowVersion();

		builder.Property(x => x.CreatedAt)
			.IsRequired();

		builder.Property(x => x.CreatedBy)
			.HasUserIdConversion()
			.IsRequired();

		builder.Property(x => x.AcceptedBy)
			.HasOptionalUserIdConversion()
			.IsRequired(false);
		
		builder.Property(x => x.RevokedBy)
			.HasOptionalUserIdConversion()
			.IsRequired(false);
	}
}
