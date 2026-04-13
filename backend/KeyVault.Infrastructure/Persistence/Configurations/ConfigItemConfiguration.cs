using KeyVault.Domain.ConfigItems;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KeyVault.Infrastructure.Persistence.Configurations;

public sealed class ConfigItemConfiguration : IEntityTypeConfiguration<ConfigItem>
{
	public void Configure(EntityTypeBuilder<ConfigItem> builder)
	{
		builder.ToTable("config_items");

		builder.HasKey(x => x.Id);

		builder.Property(x => x.Id)
			.ValueGeneratedNever();

		builder.HasIndex(x => new { x.ProjectId, x.Key })
			.IsUnique();

		builder.Property(x => x.ProjectId)
			.IsRequired();
		
		builder.Navigation(x => x.Values)
			.UsePropertyAccessMode(PropertyAccessMode.Field);	
		
		builder.HasMany(x => x.Values)
			.WithOne()
			.HasForeignKey(x => x.ConfigItemId);
		
		builder.Property(x => x.Key)
			.HasConversion(key => key.Value, value => ConfigKey.Create(value))
			.HasMaxLength(64)
			.IsRequired();

		builder.Property(x => x.CreatedAt)
			.IsRequired();
	}
}