using KeyVault.Domain;
using KeyVault.Domain.ConfigItems;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KeyVault.Infrastructure.Persistence.Configurations;

public sealed class ConfigValueRevisionConfiguration : IEntityTypeConfiguration<ConfigValueRevision>
{
	public void Configure(EntityTypeBuilder<ConfigValueRevision> builder)
	{
		builder.ToTable("config_value_revisions");

		builder.HasKey(x => new { x.ConfigItemId, x.EnvironmentId, x.Revision });

		builder.HasIndex(x => new { x.ProjectId, x.ConfigItemId, x.EnvironmentId, x.Revision });

		builder.Property(x => x.ProjectId)
			.IsRequired();

		builder.Property(x => x.Value)
			.IsRequired()
			.HasColumnType("bytea")
			.HasConversion(
				value => value.Payload.ToArray(),
				payload => EncryptedValue.FromPayload(payload));

		builder.Property(x => x.ModifiedBy)
			.HasActorIdConversion()
			.IsRequired();

		builder.Property(x => x.ModifiedAt)
			.IsRequired();
	}
}
