using KeyVault.Domain;
using KeyVault.Domain.ConfigItems;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KeyVault.Infrastructure.Persistence.Configurations;

public class ConfigValueConfiguration : IEntityTypeConfiguration<ConfigValue>
{
	public void Configure(EntityTypeBuilder<ConfigValue> builder)
	{
		builder.ToTable("config_values");

		builder.HasKey(x => new { x.ConfigItemId, x.EnvironmentId });
		
		builder.HasOne(x => x.ConfigItem)
			.WithMany(x => x.Values)
			.HasForeignKey(x => x.ConfigItemId)
			.OnDelete(DeleteBehavior.Cascade);
		
		builder.HasOne(x => x.Environment)
			.WithMany()
			.HasForeignKey(x => x.EnvironmentId)
			.OnDelete(DeleteBehavior.Cascade);

		builder.Property(x => x.Value)
			.IsRequired()
			.HasColumnType("bytea")
			.HasConversion(
				value => value.Payload.ToArray(),
				payload => EncryptedValue.FromPayload(payload));

		builder.Property(x => x.LastModifiedBy)
			.HasActorIdConversion()
			.IsRequired();
		
		builder.Property(x => x.LastModifiedAt)
			.IsRequired();
	}
}
