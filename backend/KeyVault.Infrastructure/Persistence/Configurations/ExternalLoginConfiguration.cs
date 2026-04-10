using KeyVault.Domain.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KeyVault.Infrastructure.Persistence.Configurations;

public sealed class ExternalLoginConfiguration : IEntityTypeConfiguration<ExternalLogin>
{
	public void Configure(EntityTypeBuilder<ExternalLogin> builder)
	{
		builder.ToTable("external_logins");

		builder.HasKey(x => new { x.Issuer, x.Subject });

		builder.Property(x => x.Issuer)
			.HasMaxLength(256)
			.IsRequired();

		builder.Property(x => x.Subject)
			.HasMaxLength(256)
			.IsRequired();

		builder.Property(x => x.UserId)
			.IsRequired();
	}
}