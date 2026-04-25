using KeyVault.Application.Abstractions.Cryptography;
using KeyVault.Application.Persistence;
using KeyVault.Application.Projects;
using KeyVault.Application.Projects.Commands.CreateProject;
using KeyVault.Domain;
using KeyVault.Domain.Projects;
using KeyVault.Tests.Unit.Fakes;
using Microsoft.Extensions.Time.Testing;

namespace KeyVault.Tests.Unit.Projects;

public sealed class CreateProjectHandlerTests
{
	[Fact]
	public async Task HandleAsync_ShouldCreateProjectWithEncryptedDataKey()
	{
		var user = new FakeUserContext();
		var projects = new FakeProjectRepository();
		var uow = new FakeUnitOfWork();
		var time = new FakeTimeProvider();
		var encryption = new FakeEnvelopeEncryptionService();
		var sut = new Handler(user, projects, uow, time, encryption);

		var projectId = await sut.HandleAsync(new Command("project"), CancellationToken.None);

		var project = Assert.IsType<Project>(projects.AddedProject);
		Assert.Equal(project.Id, projectId);
		Assert.Equal(encryption.GeneratedDataKey.Payload.ToArray(), project.CurrentDataKey.Value.Payload.ToArray());
		Assert.Equal(time.GetUtcNow(), project.CreatedAt);
		Assert.True(uow.SaveChangesCalled);
	}


	private sealed class FakeProjectRepository : IProjectRepository
	{
		public Project? AddedProject { get; private set; }

		public Task<Project?> GetByIdAsync(Guid id, CancellationToken ct) => throw new NotImplementedException();
		public void Add(Project project) => AddedProject = project;
		public void Remove(Project project) => throw new NotImplementedException();
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
		public EncryptedValue GeneratedDataKey { get; } = TestEncryptedValue(10);

		public EncryptedValue GenerateDataKey() => GeneratedDataKey;
		public EncryptedValue EncryptSecret(string plainText, EncryptedValue wrappedKey) => throw new NotImplementedException();
		public string DecryptSecret(EncryptedValue value, EncryptedValue wrappedKey) => throw new NotImplementedException();
	}

	private static EncryptedValue TestEncryptedValue(byte seed)
		=> EncryptedValue.Create(
			1,
			Enumerable.Range(0, 12).Select(offset => (byte)(seed + offset)).ToArray(),
			[(byte)(seed + 20)],
			Enumerable.Range(0, 16).Select(offset => (byte)(seed + 40 + offset)).ToArray());
}
