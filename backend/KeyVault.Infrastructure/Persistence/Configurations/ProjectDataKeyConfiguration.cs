using KeyVault.Domain;
using KeyVault.Domain.Projects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KeyVault.Infrastructure.Persistence.Configurations;

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