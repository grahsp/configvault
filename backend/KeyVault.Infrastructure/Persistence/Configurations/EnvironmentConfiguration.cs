using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Environment = KeyVault.Domain.Projects.Environment;

namespace KeyVault.Infrastructure.Persistence.Configurations;

public sealed class EnvironmentConfiguration : IEntityTypeConfiguration<Environment>
{
	public void Configure(EntityTypeBuilder<Environment> builder)
	{
		builder.ToTable("project_environments");

		builder.HasKey(x => x.Id);

		builder.Property(x => x.Id)
			.ValueGeneratedNever();

		builder.HasIndex(x => new { x.ProjectId, x.Name })
			.IsUnique();

		builder.Property(x => x.ProjectId)
			.IsRequired();
		
		builder.Property(x => x.Name)
			.HasMaxLength(32)
			.IsRequired();

		builder.Property(x => x.CreatedAt)
			.IsRequired();
	}
}
