using KeyVault.Domain.Identity;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KeyVault.Infrastructure.Persistence.Configurations;

public static class PropertyBuilderExtensions
{
	public static PropertyBuilder<UserId> HasUserIdConversion(
		this PropertyBuilder<UserId> builder)
	{
		return builder
			.HasConversion(
				id => id.ToString(),
				value => UserId.Parse(value))
			.HasMaxLength(32);
	}
	
	public static PropertyBuilder<UserId?> HasOptionalUserIdConversion(
		this PropertyBuilder<UserId?> builder)
	{
		return builder
			.HasConversion(
				id => id != null ? id.ToString() : null,
				value => value != null ? UserId.Parse(value) : null)
			.HasMaxLength(32);
	}

	public static PropertyBuilder<ActorId> HasActorIdConversion(
		this PropertyBuilder<ActorId> builder)
	{
		return builder
			.HasConversion(
				id => id.Value,
				value => ActorId.Parse(value))
			.HasMaxLength(200);
	}
}
