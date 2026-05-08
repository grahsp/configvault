using KeyVault.Domain;
using KeyVault.Domain.ConfigItems;
using KeyVault.Domain.ConfigItems.Exceptions;
using KeyVault.Domain.Identity;

namespace KeyVault.Tests.Unit.ConfigItems;

public sealed class ConfigValueRevisionOwnershipTests
{
	[Fact]
	public void SetValue_InitialValue_ShouldCreateRevisionInsideConfigValue()
	{
		var now = new DateTimeOffset(2026, 05, 08, 12, 00, 00, TimeSpan.Zero);
		var configItem = ConfigItem.Create(Guid.NewGuid(), ConfigKey.Create("API_KEY"), now);
		var environmentId = Guid.NewGuid();
		var actorId = ActorId.User("https://issuer.example", "owner");
		var encrypted = TestEncryptedValue(1);

		configItem.SetValue(environmentId, encrypted, actorId, now, 0);

		var value = Assert.Single(configItem.Values);
		var revision = Assert.Single(value.Revisions);
		Assert.Equal(1u, value.Revision);
		Assert.Equal(1u, revision.Revision);
		Assert.Equal(configItem.Id, revision.ConfigItemId);
		Assert.Equal(environmentId, revision.EnvironmentId);
		Assert.Equal(actorId, revision.ModifiedBy);
		Assert.Equal(now, revision.ModifiedAt);
	}

	[Fact]
	public void SetValue_Update_ShouldIncrementRevisionAndAppendRevisionChild()
	{
		var now = new DateTimeOffset(2026, 05, 08, 12, 00, 00, TimeSpan.Zero);
		var configItem = ConfigItem.Create(Guid.NewGuid(), ConfigKey.Create("API_KEY"), now);
		var environmentId = Guid.NewGuid();
		var actorId = ActorId.User("https://issuer.example", "owner");

		configItem.SetValue(environmentId, TestEncryptedValue(1), actorId, now, 0);
		configItem.SetValue(environmentId, TestEncryptedValue(2), actorId, now.AddMinutes(1), 1);

		var value = Assert.Single(configItem.Values);
		Assert.Equal(2u, value.Revision);
		Assert.Collection(
			value.Revisions,
			revision => Assert.Equal(1u, revision.Revision),
			revision => Assert.Equal(2u, revision.Revision));
	}

	[Fact]
	public void SetValue_RestoreCopyForward_ShouldAppendNewLatestRevision()
	{
		var now = new DateTimeOffset(2026, 05, 08, 12, 00, 00, TimeSpan.Zero);
		var configItem = ConfigItem.Create(Guid.NewGuid(), ConfigKey.Create("API_KEY"), now);
		var environmentId = Guid.NewGuid();
		var actorId = ActorId.User("https://issuer.example", "owner");
		var firstValue = TestEncryptedValue(1);
		var secondValue = TestEncryptedValue(2);

		configItem.SetValue(environmentId, firstValue, actorId, now, 0);
		configItem.SetValue(environmentId, secondValue, actorId, now.AddMinutes(1), 1);
		configItem.SetValue(environmentId, firstValue, actorId, now.AddMinutes(2), 2);

		var value = Assert.Single(configItem.Values);
		Assert.Equal(3u, value.Revision);
		Assert.Equal(value.Revision, value.Revisions[^1].Revision);
		Assert.Equal(firstValue.Payload.ToArray(), value.Value.Payload.ToArray());
		Assert.Equal(firstValue.Payload.ToArray(), value.Revisions[^1].Value.Payload.ToArray());
	}

	[Fact]
	public void SetValue_StaleExpectedRevision_ShouldThrow()
	{
		var now = new DateTimeOffset(2026, 05, 08, 12, 00, 00, TimeSpan.Zero);
		var configItem = ConfigItem.Create(Guid.NewGuid(), ConfigKey.Create("API_KEY"), now);
		var environmentId = Guid.NewGuid();
		var actorId = ActorId.User("https://issuer.example", "owner");

		configItem.SetValue(environmentId, TestEncryptedValue(1), actorId, now, 0);

		Assert.Throws<StaleConfigValueRevisionException>(() =>
			configItem.SetValue(environmentId, TestEncryptedValue(2), actorId, now.AddMinutes(1), 0));
	}

	private static EncryptedValue TestEncryptedValue(byte seed)
		=> EncryptedValue.Create(
			1,
			Enumerable.Range(0, 12).Select(offset => (byte)(seed + offset)).ToArray(),
			[(byte)(seed + 20)],
			Enumerable.Range(0, 16).Select(offset => (byte)(seed + 40 + offset)).ToArray());
}
