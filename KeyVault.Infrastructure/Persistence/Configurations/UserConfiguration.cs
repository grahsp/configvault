using KeyVault.Domain.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KeyVault.Infrastructure.Persistence.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
	public void Configure(EntityTypeBuilder<User> builder)
	{
		builder.ToTable("users");

		builder.HasKey(x => x.Id);

		builder.Property(x => x.Id)
			.ValueGeneratedNever();

		builder.Property(x => x.Email)
			.HasMaxLength(256);
		
		builder.Property(x => x.Name)
			.HasMaxLength(256);
		
		builder.Property(x => x.CreatedAt)
			.IsRequired();

		builder.HasMany<ExternalLogin>(x => x.ExternalLogins)
			.WithOne()
			.HasForeignKey(x => x.UserId)
			.OnDelete(DeleteBehavior.Cascade);

		builder.Navigation(x => x.ExternalLogins)
			.HasField("_externalLogins")
			.UsePropertyAccessMode(PropertyAccessMode.Field);
	}
}