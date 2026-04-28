using KeyVault.Application.Actors;
using KeyVault.Application.Authorization;
using KeyVault.Application.Authorization.Capabilities;
using KeyVault.Application.ConfigItems.BatchExecution;
using KeyVault.Application.ConfigItems.BatchExecution.Models;
using KeyVault.Application.ConfigItems.BatchExecution.Operations;
using KeyVault.Application.ConfigItems.BatchExecution.Planning;
using KeyVault.Application.Projects;
using KeyVault.Domain;
using KeyVault.Domain.ConfigItems;
using KeyVault.Domain.Projects;
using KeyVault.Tests.Unit.Fakes;
using Microsoft.Extensions.Time.Testing;
using AddConfigItemCommand = KeyVault.Application.ConfigItems.Commands.AddConfigItem.Command;
using AddConfigItemHandler = KeyVault.Application.ConfigItems.Commands.AddConfigItem.Handler;
using RemoveConfigItemCommand = KeyVault.Application.ConfigItems.Commands.RemoveConfigItem.Command;
using RemoveConfigItemHandler = KeyVault.Application.ConfigItems.Commands.RemoveConfigItem.Handler;
using RenameConfigItemCommand = KeyVault.Application.ConfigItems.Commands.RenameConfigItem.Command;
using RenameConfigItemHandler = KeyVault.Application.ConfigItems.Commands.RenameConfigItem.Handler;
using SetConfigValueCommand = KeyVault.Application.ConfigItems.Commands.SetConfigValue.Command;
using SetConfigValueHandler = KeyVault.Application.ConfigItems.Commands.SetConfigValue.Handler;

namespace KeyVault.Tests.Unit.ConfigItems;

public sealed class ConfigItemCommandAdapterTests
{
	[Fact]
	public async Task AddConfigItem_ShouldAuthorizePlanAndExecuteCreateOperation()
	{
		var fixture = new Fixture();
		var sut = new AddConfigItemHandler(
			fixture.Projects,
			fixture.Actor,
			fixture.Authorization,
			fixture.Planner,
			fixture.Executor);
		var key = ConfigKey.Create("SECRET");

		await sut.HandleAsync(new AddConfigItemCommand(fixture.Project.Id, key), CancellationToken.None);

		Assert.Equal(fixture.Project.Id, fixture.Projects.LastRequestedId);
		Assert.Same(fixture.Project, fixture.Authorization.Project);
		Assert.Equal(ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Write), fixture.Authorization.Capability);
		Assert.Same(fixture.Actor, fixture.Planner.Actor);

		var batch = fixture.Planner.Batch!;
		Assert.Null(batch.EnvironmentName);
		var operation = Assert.IsType<CreateItem>(Assert.Single(batch.Operations));
		Assert.Equal(key, operation.Key);
		Assert.Null(operation.InitialValue);

		Assert.Same(fixture.PreparedBatch, fixture.Executor.Batch);
	}

	[Fact]
	public async Task RenameConfigItem_ShouldAuthorizePlanAndExecuteRenameOperation()
	{
		var fixture = new Fixture();
		var sut = new RenameConfigItemHandler(
			fixture.Projects,
			fixture.Actor,
			fixture.Authorization,
			fixture.Planner,
			fixture.Executor);
		var configItemId = Guid.NewGuid();
		var key = ConfigKey.Create("RENAMED_SECRET");

		await sut.HandleAsync(new RenameConfigItemCommand(fixture.Project.Id, configItemId, key), CancellationToken.None);

		Assert.Equal(ProjectCapability.Create(ProjectResource.ConfigItem, ProjectPermission.Manage), fixture.Authorization.Capability);
		var batch = fixture.Planner.Batch!;
		Assert.Null(batch.EnvironmentName);
		var operation = Assert.IsType<RenameItem>(Assert.Single(batch.Operations));
		Assert.Equal(configItemId, operation.ConfigItemId);
		Assert.Equal(key, operation.Key);
		Assert.Same(fixture.PreparedBatch, fixture.Executor.Batch);
	}

	[Fact]
	public async Task RemoveConfigItem_ShouldAuthorizePlanAndExecuteDeleteOperation()
	{
		var fixture = new Fixture();
		var sut = new RemoveConfigItemHandler(
			fixture.Projects,
			fixture.Actor,
			fixture.Authorization,
			fixture.Planner,
			fixture.Executor);
		var configItemId = Guid.NewGuid();

		await sut.HandleAsync(new RemoveConfigItemCommand(fixture.Project.Id, configItemId), CancellationToken.None);

		Assert.Equal(ProjectCapability.Create(ProjectResource.ConfigItem, ProjectPermission.Manage), fixture.Authorization.Capability);
		var batch = fixture.Planner.Batch!;
		Assert.Null(batch.EnvironmentName);
		var operation = Assert.IsType<DeleteItem>(Assert.Single(batch.Operations));
		Assert.Equal(configItemId, operation.ConfigItemId);
		Assert.Same(fixture.PreparedBatch, fixture.Executor.Batch);
	}

	[Fact]
	public async Task SetConfigValue_ShouldAuthorizePlanAndExecuteSetValueOperation()
	{
		var fixture = new Fixture();
		var sut = new SetConfigValueHandler(
			fixture.Projects,
			fixture.Actor,
			fixture.Authorization,
			fixture.Planner,
			fixture.Executor);
		var configItemId = Guid.NewGuid();

		await sut.HandleAsync(new SetConfigValueCommand(fixture.Project.Id, configItemId, "production", "secret"), CancellationToken.None);

		Assert.Equal(ProjectCapability.Create(ProjectResource.ConfigValue, ProjectPermission.Write), fixture.Authorization.Capability);
		var batch = fixture.Planner.Batch!;
		Assert.Equal("production", batch.EnvironmentName);
		var operation = Assert.IsType<SetValue>(Assert.Single(batch.Operations));
		Assert.Equal(configItemId, operation.ConfigItemId);
		Assert.Equal("secret", operation.Value);
		Assert.Same(fixture.PreparedBatch, fixture.Executor.Batch);
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
			PreparedBatch = new PreparedBatch(Actor, Project, null, [], [new DeleteItem(Guid.NewGuid())]);
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
		public ProjectCapability? Capability { get; private set; }
		public Project? Project { get; private set; }

		public Task<bool> CanAccessAsync(ProjectCapability capability, Project project, CancellationToken ct)
		{
			Capability = capability;
			Project = project;
			return Task.FromResult(true);
		}

		public Task EnsureCanAccessAsync(ProjectCapability capability, Project project, CancellationToken ct)
		{
			Capability = capability;
			Project = project;
			return Task.CompletedTask;
		}
	}

	private sealed class CapturingPlanner : IConfigItemBatchPlanner
	{
		public IActorContext? Actor { get; private set; }
		public Project? Project { get; private set; }
		public OperationBatch? Batch { get; private set; }
		public PreparedBatch PreparedBatch { get; set; } = null!;

		public Task<PreparedBatch> PrepareAsync(IActorContext actor, Project project, OperationBatch batch, CancellationToken ct)
		{
			Actor = actor;
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
