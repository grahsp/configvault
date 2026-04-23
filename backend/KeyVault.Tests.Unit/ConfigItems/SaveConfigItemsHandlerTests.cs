using KeyVault.Application.Abstractions.Cryptography;
using KeyVault.Application.Authentication;
using KeyVault.Application.ConfigItems.Commands.SaveConfigItems;
using KeyVault.Application.ConfigItems;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects;
using KeyVault.Domain;
using KeyVault.Domain.ConfigItems;
using KeyVault.Domain.Projects;
using KeyVault.Domain.Users;
using Microsoft.Extensions.Time.Testing;

namespace KeyVault.Tests.Unit.ConfigItems;

public sealed class SaveConfigItemsHandlerTests
{
	[Fact]
	public async Task HandleAsync_ShouldEncryptNonNullValueBeforeStoring()
	{
		var fixture = new Fixture();
		var sut = new Handler(
			fixture.User,
			fixture.Projects,
			fixture.Configurations,
			fixture.Uow,
			fixture.Time,
			fixture.Encryption);
		var command = new Command(
			fixture.Project.Id,
			"development",
			[new ConfigItemUpdate(fixture.ConfigItem.Id, null, "secret")],
			[]);

		await sut.HandleAsync(command, CancellationToken.None);

		var storedValue = Assert.Single(fixture.ConfigItem.Values);
		Assert.Equal(fixture.Encryption.EncryptedSecret.Payload.ToArray(), storedValue.Value.Payload.ToArray());
		Assert.NotEqual(System.Text.Encoding.UTF8.GetBytes("secret"), storedValue.Value.Payload.ToArray());
		Assert.Equal("secret", fixture.Encryption.EncryptedPlaintext);
		Assert.Equal(
			fixture.Project.CurrentDataKey.Value.Payload.ToArray(),
			fixture.Encryption.EncryptionWrappedKey!.Payload.ToArray());
		Assert.True(fixture.Uow.SaveChangesCalled);
	}

	[Fact]
	public async Task HandleAsync_ShouldUpdateKeyWithoutEncrypting_WhenValueIsNull()
	{
		var fixture = new Fixture();
		var sut = new Handler(
			fixture.User,
			fixture.Projects,
			fixture.Configurations,
			fixture.Uow,
			fixture.Time,
			fixture.Encryption);
		var newKey = ConfigKey.Create("RENAMED_SECRET");
		var command = new Command(
			fixture.Project.Id,
			"development",
			[new ConfigItemUpdate(fixture.ConfigItem.Id, newKey, null)],
			[]);

		await sut.HandleAsync(command, CancellationToken.None);

		Assert.Equal(newKey, fixture.ConfigItem.Key);
		Assert.Empty(fixture.ConfigItem.Values);
		Assert.Null(fixture.Encryption.EncryptedPlaintext);
		Assert.Null(fixture.Encryption.EncryptionWrappedKey);
		Assert.True(fixture.Uow.SaveChangesCalled);
	}

	private sealed class Fixture
	{
		public FakeUserContext User { get; } = new();
		public FakeProjectRepository Projects { get; } = new();
		public FakeConfigItemRepository Configurations { get; } = new();
		public FakeUnitOfWork Uow { get; } = new();
		public FakeTimeProvider Time { get; } = new();
		public FakeEnvelopeEncryptionService Encryption { get; } = new();
		public Project Project { get; }
		public ConfigItem ConfigItem { get; }

		public Fixture()
		{
			Project = Project.Create(User.UserId, "project", TestEncryptedValue(1), Time.GetUtcNow());
			ConfigItem = ConfigItem.Create(Project.Id, ConfigKey.Create("SECRET"), Time.GetUtcNow());

			Projects.Project = Project;
			Configurations.ConfigItems[ConfigItem.Id] = ConfigItem;
		}
	}

	private sealed class FakeUserContext : IUserContext
	{
		public Guid UserId { get; set; } = Guid.NewGuid();
		public UserStatus Status => UserStatus.Active;
		public bool IsActive => true;
		public bool IsAuthenticated => true;
	}

	private sealed class FakeProjectRepository : IProjectRepository
	{
		public Project? Project { get; set; }

		public Task<Project?> GetByIdAsync(Guid id, CancellationToken ct)
			=> Task.FromResult(Project?.Id == id ? Project : null);

		public void Add(Project project) => throw new NotImplementedException();
		public void Remove(Project project) => throw new NotImplementedException();
	}

	private sealed class FakeConfigItemRepository : IConfigItemRepository
	{
		public Dictionary<Guid, ConfigItem> ConfigItems { get; } = [];

		public Task<ConfigItem?> GetByIdAsync(Guid id, CancellationToken ct)
			=> Task.FromResult(ConfigItems.TryGetValue(id, out var configItem) ? configItem : null);

		public Task<bool> ExistsAsync(Guid projectId, ConfigKey key, CancellationToken ct) => throw new NotImplementedException();
		public void Add(ConfigItem configItem) => throw new NotImplementedException();
		public void Remove(ConfigItem configItem) => ConfigItems.Remove(configItem.Id);
	}

	private sealed class FakeUnitOfWork : IUnitOfWork
	{
		public bool SaveChangesCalled { get; private set; }

		public Task<int> SaveChangesAsync(CancellationToken ct = default)
		{
			SaveChangesCalled = true;
			return Task.FromResult(1);
		}
	}

	private sealed class FakeEnvelopeEncryptionService : IEnvelopeEncryptionService
	{
		public EncryptedValue EncryptedSecret { get; } = TestEncryptedValue(80);
		public string? EncryptedPlaintext { get; private set; }
		public EncryptedValue? EncryptionWrappedKey { get; private set; }

		public EncryptedValue GenerateDataKey() => throw new NotImplementedException();

		public EncryptedValue EncryptSecret(string plainText, EncryptedValue wrappedKey)
		{
			EncryptedPlaintext = plainText;
			EncryptionWrappedKey = wrappedKey;
			return EncryptedSecret;
		}

		public string DecryptSecret(EncryptedValue value, EncryptedValue wrappedKey) => throw new NotImplementedException();
	}

	private static EncryptedValue TestEncryptedValue(byte seed)
		=> EncryptedValue.Create(
			1,
			Enumerable.Range(0, 12).Select(offset => (byte)(seed + offset)).ToArray(),
			[(byte)(seed + 20)],
			Enumerable.Range(0, 16).Select(offset => (byte)(seed + 40 + offset)).ToArray());
}
