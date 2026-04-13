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

		builder.Property(x => x.Value)
			.HasMaxLength(256);

		builder.Property(x => x.LastModifiedBy)
			.IsRequired();
		
		builder.Property(x => x.LastModifiedAt)
			.IsRequired();
	}
}
