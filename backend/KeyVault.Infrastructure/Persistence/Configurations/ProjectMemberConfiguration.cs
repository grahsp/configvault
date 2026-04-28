using KeyVault.Domain.Projects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KeyVault.Infrastructure.Persistence.Configurations;

public sealed class ProjectMemberConfiguration : IEntityTypeConfiguration<ProjectMember>
{
	public void Configure(EntityTypeBuilder<ProjectMember> builder)
	{
		builder.ToTable("project_members");

		builder.HasKey(x => new { x.ProjectId, x.UserId });

		builder.HasIndex(x => x.UserId);

		builder.Property(x => x.UserId)
			.HasUserIdConversion()
			.ValueGeneratedNever()
			.IsRequired();

		builder.Property(x => x.Role)
			.IsRequired();

		builder.HasOne<Project>()
			.WithMany(x => x.Members)
			.HasForeignKey(x => x.ProjectId)
			.OnDelete(DeleteBehavior.Cascade);
	}
}
