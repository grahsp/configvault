using KeyVault.Application.Abstractions.Cryptography;
using KeyVault.Application.Authentication;
using KeyVault.Application.ConfigItems;
using GetConfigValueHandler = KeyVault.Application.ConfigItems.Commands.GetConfigValue.Handler;
using GetConfigValueQuery = KeyVault.Application.ConfigItems.Commands.GetConfigValue.Query;
using ExecuteBatchProcessor = KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations.Processor;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects;
using KeyVault.Domain;
using KeyVault.Domain.ConfigItems;
using KeyVault.Domain.Projects;
using KeyVault.Domain.Users;
using Microsoft.Extensions.Time.Testing;
using SetConfigValueCommand = KeyVault.Application.ConfigItems.Commands.SetConfigValue.Command;
using SetConfigValueHandler = KeyVault.Application.ConfigItems.Commands.SetConfigValue.Handler;

namespace KeyVault.Tests.Unit.ConfigItems;

public sealed class ConfigValueEncryptionHandlerTests
{
	[Fact]
	public async Task SetConfigValue_ShouldEncryptPlaintextBeforeStoring()
	{
		var fixture = new Fixture();
		var processor = fixture.CreateProcessor();
		var sut = new SetConfigValueHandler(processor);
		var command = new SetConfigValueCommand(fixture.Project.Id, fixture.Configuration.Id, "development", "secret");

		await sut.HandleAsync(command, CancellationToken.None);

		var value = Assert.Single(fixture.Configuration.Values);
		Assert.Equal(fixture.Encryption.EncryptedSecret.Payload.ToArray(), value.Value.Payload.ToArray());
		Assert.Equal("secret", fixture.Encryption.EncryptedPlaintext);
		Assert.Equal(fixture.Project.CurrentDataKey.Value.Payload.ToArray(), fixture.Encryption.EncryptionWrappedKey!.Payload.ToArray());
		Assert.True(fixture.Uow.SaveChangesCalled);
	}

	[Fact]
	public async Task GetConfigValue_ShouldDecryptStoredValueForProjectMember()
	{
		var fixture = new Fixture();
		var encryptedValue = fixture.Encryption.EncryptedSecret;
		fixture.Configuration.SetValue(fixture.DevelopmentEnvironment.Id, encryptedValue, fixture.User.UserId, fixture.Time.GetUtcNow());
		var sut = new GetConfigValueHandler(fixture.User, fixture.Projects, fixture.Configurations, fixture.Encryption);
		var query = new GetConfigValueQuery(fixture.Project.Id, fixture.Configuration.Id, "development");

		var result = await sut.HandleAsync(query, CancellationToken.None);

		Assert.NotNull(result);
		Assert.Equal(fixture.Encryption.DecryptedSecret, result.Value);
		Assert.Equal(encryptedValue.Payload.ToArray(), fixture.Encryption.DecryptedValue!.Payload.ToArray());
		Assert.Equal(fixture.Project.CurrentDataKey.Value.Payload.ToArray(), fixture.Encryption.DecryptionWrappedKey!.Payload.ToArray());
	}

	[Fact]
	public async Task GetConfigValue_ShouldReturnNull_WhenUserIsNotProjectMember()
	{
		var fixture = new Fixture();
		fixture.User.UserId = Guid.NewGuid();
		fixture.Configuration.SetValue(
			fixture.DevelopmentEnvironment.Id,
			fixture.Encryption.EncryptedSecret,
			fixture.Project.Members[0].UserId,
			fixture.Time.GetUtcNow());
		var sut = new GetConfigValueHandler(fixture.User, fixture.Projects, fixture.Configurations, fixture.Encryption);
		var query = new GetConfigValueQuery(fixture.Project.Id, fixture.Configuration.Id, "development");

		var result = await sut.HandleAsync(query, CancellationToken.None);

		Assert.Null(result);
		Assert.Null(fixture.Encryption.DecryptedValue);
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
		public ConfigItem Configuration { get; }
		public KeyVault.Domain.Projects.Environment DevelopmentEnvironment { get; }

		public Fixture()
		{
			Project = Project.Create(User.UserId, "project", TestEncryptedValue(1), Time.GetUtcNow());
			DevelopmentEnvironment = Project.Environments.Single(e => e.Name == "development");
			Configuration = ConfigItem.Create(Project.Id, ConfigKey.Create("SECRET"), Time.GetUtcNow());

			Projects.Project = Project;
			Configurations.Configuration = Configuration;
		}

		public ExecuteBatchProcessor CreateProcessor()
			=> new(
				User,
				Projects,
				Configurations,
				Uow,
				new KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations.Executor(Encryption, Time));
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
		public ConfigItem? Configuration { get; set; }

		public Task<ConfigItem?> GetByIdAsync(Guid id, CancellationToken ct)
			=> Task.FromResult(Configuration?.Id == id ? Configuration : null);

		public Task<bool> ExistsAsync(Guid projectId, ConfigKey key, CancellationToken ct) => throw new NotImplementedException();
		public void Add(ConfigItem configItem) => throw new NotImplementedException();
		public void Remove(ConfigItem configItem) => throw new NotImplementedException();
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
		public string DecryptedSecret { get; } = "secret";
		public string? EncryptedPlaintext { get; private set; }
		public EncryptedValue? EncryptionWrappedKey { get; private set; }
		public EncryptedValue? DecryptedValue { get; private set; }
		public EncryptedValue? DecryptionWrappedKey { get; private set; }

		public EncryptedValue GenerateDataKey() => throw new NotImplementedException();

		public EncryptedValue EncryptSecret(string plainText, EncryptedValue wrappedKey)
		{
			EncryptedPlaintext = plainText;
			EncryptionWrappedKey = wrappedKey;
			return EncryptedSecret;
		}

		public string DecryptSecret(EncryptedValue value, EncryptedValue wrappedKey)
		{
			DecryptedValue = value;
			DecryptionWrappedKey = wrappedKey;
			return DecryptedSecret;
		}
	}

	private static EncryptedValue TestEncryptedValue(byte seed)
		=> EncryptedValue.Create(
			1,
			Enumerable.Range(0, 12).Select(offset => (byte)(seed + offset)).ToArray(),
			[(byte)(seed + 20)],
			Enumerable.Range(0, 16).Select(offset => (byte)(seed + 40 + offset)).ToArray());
}
