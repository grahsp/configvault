using KeyVault.Application.Abstractions.Cryptography;
using KeyVault.Application.Authentication;
using KeyVault.Application.ConfigItems;
using KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations;
using KeyVault.Application.ConfigItems.Exceptions;
using KeyVault.Application.Exceptions;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects;
using KeyVault.Domain;
using KeyVault.Domain.ConfigItems;
using KeyVault.Domain.Projects;
using KeyVault.Domain.Users;
using Microsoft.Extensions.Time.Testing;

namespace KeyVault.Tests.Unit.ConfigItems;

public sealed class ExecuteBatchOperationsProcessorTests
{
	[Fact]
	public async Task HandleAsync_ShouldExecuteOperationsInOrder_AndSaveOnce()
	{
		var fixture = new Fixture();
		var sut = fixture.CreateProcessor();
		var command = new Command(
			fixture.Project.Id,
			"development",
			new BatchRequest(
			[
				new RenameItem(fixture.SecondConfigItem.Id, ConfigKey.Create("SECOND_RENAMED")),
				new RenameItem(fixture.ConfigItem.Id, ConfigKey.Create("SECOND")),
				new SetValue(fixture.ConfigItem.Id, "secret")
			]));

		await sut.ExecuteAsync(command, CancellationToken.None);

		Assert.Equal(ConfigKey.Create("SECOND"), fixture.ConfigItem.Key);
		Assert.Equal(ConfigKey.Create("SECOND_RENAMED"), fixture.SecondConfigItem.Key);

		var storedValue = Assert.Single(fixture.ConfigItem.Values);
		Assert.Equal(fixture.Encryption.EncryptedSecret.Payload.ToArray(), storedValue.Value.Payload.ToArray());
		Assert.Equal("secret", fixture.Encryption.EncryptedPlaintext);
		Assert.Equal(1, fixture.Uow.SaveChangesCallCount);
	}

	[Fact]
	public async Task HandleAsync_ShouldTreatOperationsAfterDelete_AsMissing()
	{
		var fixture = new Fixture();
		var sut = fixture.CreateProcessor();
		var command = new Command(
			fixture.Project.Id,
			"development",
			new BatchRequest(
			[
				new DeleteItem(fixture.ConfigItem.Id),
				new SetValue(fixture.ConfigItem.Id, "secret")
			]));

		await Assert.ThrowsAsync<ConfigItemNotFoundException>(() => sut.ExecuteAsync(command, CancellationToken.None));

		Assert.True(fixture.Configurations.ConfigItems.ContainsKey(fixture.ConfigItem.Id));
		Assert.Equal(0, fixture.Uow.SaveChangesCallCount);
	}

	[Fact]
	public async Task HandleAsync_ShouldCreateItemWithInitialValue_InSameBatch()
	{
		var fixture = new Fixture();
		var sut = fixture.CreateProcessor();
		var command = new Command(
			fixture.Project.Id,
			"development",
			new BatchRequest(
			[
				new CreateItem(ConfigKey.Create("NEW_SECRET"), "initial-secret")
			]));

		await sut.ExecuteAsync(command, CancellationToken.None);

		var createdItem = Assert.Single(fixture.Configurations.AddedItems);
		Assert.Equal(ConfigKey.Create("NEW_SECRET"), createdItem.Key);

		var storedValue = Assert.Single(createdItem.Values);
		Assert.Equal(fixture.Encryption.EncryptedSecret.Payload.ToArray(), storedValue.Value.Payload.ToArray());
		Assert.Equal("initial-secret", fixture.Encryption.EncryptedPlaintext);
		Assert.Equal(1, fixture.Uow.SaveChangesCallCount);
	}

	[Fact]
	public async Task HandleAsync_ShouldAllowDeleteWithoutEnvironment()
	{
		var fixture = new Fixture();
		var sut = fixture.CreateProcessor();
		var command = new Command(
			fixture.Project.Id,
			null,
			new BatchRequest(
			[
				new DeleteItem(fixture.ConfigItem.Id)
			]));

		await sut.ExecuteAsync(command, CancellationToken.None);

		Assert.False(fixture.Configurations.ConfigItems.ContainsKey(fixture.ConfigItem.Id));
		Assert.Equal(1, fixture.Uow.SaveChangesCallCount);
	}

	[Fact]
	public async Task HandleAsync_ShouldRequireEnvironment_WhenOperationNeedsIt()
	{
		var fixture = new Fixture();
		var sut = fixture.CreateProcessor();
		var command = new Command(
			fixture.Project.Id,
			null,
			new BatchRequest(
			[
				new SetValue(fixture.ConfigItem.Id, "secret")
			]));

		await Assert.ThrowsAsync<ValidationException>(() => sut.ExecuteAsync(command, CancellationToken.None));

		Assert.Equal(0, fixture.Uow.SaveChangesCallCount);
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
		public ConfigItem SecondConfigItem { get; }

		public Fixture()
		{
			Project = Project.Create(User.UserId, "project", TestEncryptedValue(1), Time.GetUtcNow());
			ConfigItem = ConfigItem.Create(Project.Id, ConfigKey.Create("FIRST"), Time.GetUtcNow());
			SecondConfigItem = ConfigItem.Create(Project.Id, ConfigKey.Create("SECOND"), Time.GetUtcNow());

			Projects.Project = Project;
			Configurations.ConfigItems[ConfigItem.Id] = ConfigItem;
			Configurations.ConfigItems[SecondConfigItem.Id] = SecondConfigItem;
		}

		public Processor CreateProcessor()
			=> new(
				User,
				Projects,
				Configurations,
				Uow,
				new Executor(Encryption, Time));
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
		public List<ConfigItem> AddedItems { get; } = [];

		public Task<ConfigItem?> GetByIdAsync(Guid id, CancellationToken ct)
			=> Task.FromResult(ConfigItems.TryGetValue(id, out var configItem) ? configItem : null);

		public Task<bool> ExistsAsync(Guid projectId, ConfigKey key, CancellationToken ct)
			=> Task.FromResult(ConfigItems.Values.Any(item => item.ProjectId == projectId && item.Key == key));

		public void Add(ConfigItem configItem)
		{
			ConfigItems[configItem.Id] = configItem;
			AddedItems.Add(configItem);
		}

		public void Remove(ConfigItem configItem) => ConfigItems.Remove(configItem.Id);
	}

	private sealed class FakeUnitOfWork : IUnitOfWork
	{
		public int SaveChangesCallCount { get; private set; }

		public Task<int> SaveChangesAsync(CancellationToken ct = default)
		{
			SaveChangesCallCount++;
			return Task.FromResult(1);
		}
	}

	private sealed class FakeEnvelopeEncryptionService : IEnvelopeEncryptionService
	{
		public EncryptedValue EncryptedSecret { get; } = TestEncryptedValue(80);
		public string? EncryptedPlaintext { get; private set; }

		public EncryptedValue GenerateDataKey() => throw new NotImplementedException();

		public EncryptedValue EncryptSecret(string plainText, EncryptedValue wrappedKey)
		{
			EncryptedPlaintext = plainText;
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
