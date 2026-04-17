using KeyVault.Domain;
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

		builder.Property(x => x.Id)
			.ValueGeneratedNever();

		builder.Property(x => x.Name)
			.IsRequired()
			.HasMaxLength(256);

		// Data Keys
		builder.Navigation(x => x.DataKeys)
			.UsePropertyAccessMode(PropertyAccessMode.Field);

		builder.HasMany(x => x.DataKeys)
			.WithOne(x => x.Project)
			.HasForeignKey(x => x.ProjectId);
		
		// Environments
		builder.Navigation(x => x.Environments)
			.UsePropertyAccessMode(PropertyAccessMode.Field);	
		
		builder.HasMany(x => x.Environments)
			.WithOne()
			.HasForeignKey(x => x.ProjectId);

		// Members
		builder.Navigation(x => x.Members)
			.UsePropertyAccessMode(PropertyAccessMode.Field);	
		
		builder.HasMany(x => x.Members)
			.WithOne()
			.HasForeignKey(x => x.ProjectId);
		
		builder.Property(x => x.CreatedAt)
			.IsRequired();
	}
}

public sealed class ProjectDataKeyConfiguration : IEntityTypeConfiguration<ProjectDataKey>
{
	public void Configure(EntityTypeBuilder<ProjectDataKey> builder)
	{
		builder.ToTable("project_data_keys");

		builder.HasKey(x => x.Id);

		builder.Property(x => x.Id)
			.ValueGeneratedNever();

		builder.HasIndex(x => x.ProjectId);

		builder.Property(x => x.Value)
			.IsRequired()
			.HasColumnType("bytea")
			.HasConversion(
				value => value.Payload.ToArray(),
				payload => EncryptedValue.FromPayload(payload));

		builder.Property(x => x.CreatedAt)
			.IsRequired();

		builder.HasOne(x => x.Project)
			.WithMany(x => x.DataKeys)
			.HasForeignKey(x => x.ProjectId)
			.OnDelete(DeleteBehavior.Cascade);
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
