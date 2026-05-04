using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.ConfigItems.BatchExecution;
using KeyVault.Application.ConfigItems.BatchExecution.Models;
using KeyVault.Application.ConfigItems.BatchExecution.Operations;
using KeyVault.Application.ConfigItems.BatchExecution.Planning;
using KeyVault.Application.Exceptions;
using KeyVault.Application.Projects;
using KeyVault.Domain;
using KeyVault.Domain.ConfigItems;
using KeyVault.Domain.Projects;
using KeyVault.Tests.Unit.Fakes;
using Microsoft.Extensions.Time.Testing;
using BatchCommand = KeyVault.Application.ConfigItems.Commands.BatchOperations.Command;
using BatchHandler = KeyVault.Application.ConfigItems.Commands.BatchOperations.Handler;

namespace KeyVault.Tests.Unit.ConfigItems;

public sealed class ExecuteBatchOperationsHandlerTests
{
	[Fact]
	public async Task HandleAsync_ShouldAuthorizeBothActions_ForMixedBatch()
	{
		var fixture = new Fixture();
		var batch = new OperationBatch(
			[
				new RenameItem(Guid.NewGuid(), ConfigKey.Create("RENAMED_SECRET")),
				new SetValue(Guid.NewGuid(), "secret")
			],
			"development");
		var command = new BatchCommand(fixture.Project.Id, batch);
		var sut = new BatchHandler(
			fixture.Projects,
			fixture.Authorization,
			fixture.Planner,
			fixture.Executor);

		await sut.HandleAsync(command, CancellationToken.None);

		Assert.Equal(fixture.Project.Id, fixture.Projects.LastRequestedId);
		Assert.Same(fixture.Project, fixture.Authorization.Project);
		Assert.Collection(
			fixture.Authorization.Capabilities,
			capability => Assert.Equal(ProjectCapability.Create(ProjectResource.ConfigItem, ProjectPermission.Manage), capability),
			capability => Assert.Equal(ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Write), capability));
		Assert.Same(fixture.Project, fixture.Planner.Project);
		Assert.Same(batch, fixture.Planner.Batch);
		Assert.Same(fixture.PreparedBatch, fixture.Executor.Batch);
	}

	[Fact]
	public async Task HandleAsync_ShouldRequireWriteAccess_WhenBatchContainsOnlyWriteOperations()
	{
		var fixture = new Fixture();
		var batch = new OperationBatch(
			[
				new CreateItem(ConfigKey.Create("SECRET"), null),
				new SetValue(Guid.NewGuid(), "secret")
			],
			"development");
		var sut = new BatchHandler(
			fixture.Projects,
			fixture.Authorization,
			fixture.Planner,
			fixture.Executor);

		await sut.HandleAsync(new BatchCommand(fixture.Project.Id, batch), CancellationToken.None);

		Assert.Collection(
			fixture.Authorization.Capabilities,
			capability => Assert.Equal(ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Write), capability));
	}

	[Fact]
	public async Task HandleAsync_ShouldRequireManageAccess_WhenBatchContainsOnlyManageOperations()
	{
		var fixture = new Fixture();
		var batch = new OperationBatch(
			[
				new RenameItem(Guid.NewGuid(), ConfigKey.Create("RENAMED_SECRET")),
				new DeleteItem(Guid.NewGuid())
			],
			"development");
		var sut = new BatchHandler(
			fixture.Projects,
			fixture.Authorization,
			fixture.Planner,
			fixture.Executor);

		await sut.HandleAsync(new BatchCommand(fixture.Project.Id, batch), CancellationToken.None);

		Assert.Collection(
			fixture.Authorization.Capabilities,
			capability => Assert.Equal(ProjectCapability.Create(ProjectResource.ConfigItem, ProjectPermission.Manage), capability));
	}

	[Fact]
	public async Task HandleAsync_ShouldDeduplicateRepeatedActions()
	{
		var fixture = new Fixture();
		var batch = new OperationBatch(
			[
				new CreateItem(ConfigKey.Create("FIRST"), null),
				new SetValue(Guid.NewGuid(), "secret"),
				new CreateItem(ConfigKey.Create("SECOND"), null)
			],
			"development");
		var sut = new BatchHandler(
			fixture.Projects,
			fixture.Authorization,
			fixture.Planner,
			fixture.Executor);

		await sut.HandleAsync(new BatchCommand(fixture.Project.Id, batch), CancellationToken.None);

		Assert.Single(fixture.Authorization.Capabilities);
		Assert.Equal(
			ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Write),
			fixture.Authorization.Capabilities[0]);
	}

	[Fact]
	public async Task HandleAsync_ShouldFailBeforePlanning_WhenOneRequiredActionIsForbidden()
	{
		var fixture = new Fixture();
		fixture.Authorization.ForbiddenCapability = ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Write);
		var batch = new OperationBatch(
			[
				new RenameItem(Guid.NewGuid(), ConfigKey.Create("RENAMED_SECRET")),
				new SetValue(Guid.NewGuid(), "secret")
			],
			"development");
		var sut = new BatchHandler(
			fixture.Projects,
			fixture.Authorization,
			fixture.Planner,
			fixture.Executor);

		await Assert.ThrowsAsync<ForbiddenException>(() =>
			sut.HandleAsync(new BatchCommand(fixture.Project.Id, batch), CancellationToken.None));

		Assert.Null(fixture.Planner.Batch);
		Assert.Null(fixture.Executor.Batch);
	}

	private sealed class Fixture
	{
		public FakeUserContext Actor { get; } = new();
		public FakeProjectRepository Projects { get; }
		public CapturingProjectAuthorizationService Authorization { get; } = new();
		public CapturingPlanner Planner { get; } = new();
		public CapturingExecutor Executor { get; } = new();
		public Project Project { get; }
		public PreparedBatch PreparedBatch { get; }

		public Fixture()
		{
			var time = new FakeTimeProvider();
			Project = Project.Create(Actor.UserId, "project", TestEncryptedValue(1), time.GetUtcNow());
			Projects = new FakeProjectRepository(Project);
			PreparedBatch = new PreparedBatch(Project, null, [], [new DeleteItem(Guid.NewGuid())]);
			Planner.PreparedBatch = PreparedBatch;
		}
	}

	private sealed class FakeProjectRepository(Project project) : IProjectRepository
	{
		public Guid? LastRequestedId { get; private set; }

		public Task<Project?> GetByIdAsync(Guid id, CancellationToken ct)
		{
			LastRequestedId = id;
			return Task.FromResult(project.Id == id ? project : null);
		}

		public void Add(Project project) => throw new NotImplementedException();
		public void Remove(Project project) => throw new NotImplementedException();
	}

	private sealed class CapturingProjectAuthorizationService : IProjectAuthorizationService
	{
		public List<ProjectCapability> Capabilities { get; } = [];
		public Project? Project { get; private set; }
		public ProjectCapability? ForbiddenCapability { get; set; }

		public bool CanAccess(ProjectCapability capability, Project project)
			=> ForbiddenCapability != capability;

		public Task<bool> CanAccessAsync(ProjectCapability capability, Guid projectId, CancellationToken ct)
			=> Task.FromResult(ForbiddenCapability != capability);

		public void EnsureCanAccess(ProjectCapability capability, Project project)
		{
			Capabilities.Add(capability);
			Project = project;

			if (ForbiddenCapability == capability)
				throw new ForbiddenException();
		}

		public Task EnsureCanAccessAsync(ProjectCapability capability, Guid projectId, CancellationToken ct)
		{
			if (ForbiddenCapability == capability)
				throw new ForbiddenException();

			return Task.CompletedTask;
		}
	}

	private sealed class CapturingPlanner : IConfigItemBatchPlanner
	{
		public Project? Project { get; private set; }
		public OperationBatch? Batch { get; private set; }
		public PreparedBatch PreparedBatch { get; set; } = null!;

		public Task<PreparedBatch> PrepareAsync(Project project, OperationBatch batch, CancellationToken ct)
		{
			Project = project;
			Batch = batch;
			return Task.FromResult(PreparedBatch);
		}
	}

	private sealed class CapturingExecutor : IConfigItemMutationExecutor
	{
		public PreparedBatch? Batch { get; private set; }

		public Task ExecuteAsync(PreparedBatch batch, CancellationToken ct)
		{
			Batch = batch;
			return Task.CompletedTask;
		}
	}

	private static EncryptedValue TestEncryptedValue(byte seed)
		=> EncryptedValue.Create(
			1,
			Enumerable.Range(0, 12).Select(offset => (byte)(seed + offset)).ToArray(),
			[(byte)(seed + 20)],
			Enumerable.Range(0, 16).Select(offset => (byte)(seed + 40 + offset)).ToArray());
}
