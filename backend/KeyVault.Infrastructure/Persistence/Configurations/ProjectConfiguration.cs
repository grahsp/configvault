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

		builder.Ignore(x => x.CurrentDataKey);

		builder.Property(x => x.CurrentDataKeyId)
			.IsRequired();
		
		// Environments
		builder.Navigation(x => x.Environments)
			.UsePropertyAccessMode(PropertyAccessMode.Field);	
		
		builder.HasMany(x => x.Environments)
			.WithOne(x => x.Project)
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