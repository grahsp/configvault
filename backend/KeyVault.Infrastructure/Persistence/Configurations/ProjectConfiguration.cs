using KeyVault.Domain.Projects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KeyVault.Infrastructure.Persistence.Configurations;

public sealed class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
	public void Configure(EntityTypeBuilder<Project> builder)
	{
		builder.ToTable("projects");
		
		builder.HasKey(x => x.Id);

		builder.Property(x => x.Name)
			.IsRequired()
			.HasMaxLength(256);

		builder.Navigation(x => x.Members)
			.UsePropertyAccessMode(PropertyAccessMode.Field);	
		
		builder.HasMany(x => x.Members)
			.WithOne()
			.HasForeignKey(x => x.ProjectId);
		
		builder.Property(x => x.CreatedAt)
			.IsRequired();
	}
}

public sealed class ProjectMemberConfiguration : IEntityTypeConfiguration<ProjectMember>
{
	public void Configure(EntityTypeBuilder<ProjectMember> builder)
	{
		builder.ToTable("project_members");

		builder.HasKey(x => new { x.ProjectId, x.UserId });

		builder.HasIndex(x => x.UserId);

		builder.Property(x => x.Role)
			.IsRequired();

		builder.HasOne<Project>()
			.WithMany(x => x.Members)
			.HasForeignKey(x => x.ProjectId)
			.OnDelete(DeleteBehavior.Cascade);
	}
}