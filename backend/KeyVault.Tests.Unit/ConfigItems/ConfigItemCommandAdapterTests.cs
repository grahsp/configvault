using KeyVault.Application.Abstractions.Messaging;
using AddConfigItemCommand = KeyVault.Application.ConfigItems.Commands.AddConfigItem.Command;
using AddConfigItemHandler = KeyVault.Application.ConfigItems.Commands.AddConfigItem.Handler;
using ExecuteBatchCommand = KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations.Command;
using KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations;
using RemoveConfigItemCommand = KeyVault.Application.ConfigItems.Commands.RemoveConfigItem.Command;
using RemoveConfigItemHandler = KeyVault.Application.ConfigItems.Commands.RemoveConfigItem.Handler;
using RenameConfigItemCommand = KeyVault.Application.ConfigItems.Commands.RenameConfigItem.Command;
using RenameConfigItemHandler = KeyVault.Application.ConfigItems.Commands.RenameConfigItem.Handler;
using SetConfigValueCommand = KeyVault.Application.ConfigItems.Commands.SetConfigValue.Command;
using SetConfigValueHandler = KeyVault.Application.ConfigItems.Commands.SetConfigValue.Handler;
using KeyVault.Domain.ConfigItems;
using MessagingUnit = KeyVault.Application.Abstractions.Messaging.Unit;

namespace KeyVault.Tests.Unit.ConfigItems;

public sealed class ConfigItemCommandAdapterTests
{
	[Fact]
	public async Task AddConfigItem_ShouldDispatch_CreateOperation()
	{
		var processor = new CapturingProcessor();
		var sut = new AddConfigItemHandler(processor);
		var projectId = Guid.NewGuid();
		var key = ConfigKey.Create("SECRET");

		await sut.HandleAsync(new AddConfigItemCommand(projectId, key), CancellationToken.None);

		var batch = Assert.IsType<ExecuteBatchCommand>(processor.CapturedCommand);
		Assert.Equal(projectId, batch.ProjectId);
		Assert.Null(batch.EnvironmentName);
		var operation = Assert.IsType<CreateItem>(Assert.Single(batch.Batch.Operations));
		Assert.Equal(key, operation.Key);
		Assert.Null(operation.InitialValue);
	}

	[Fact]
	public async Task RenameConfigItem_ShouldDispatch_RenameOperation()
	{
		var processor = new CapturingProcessor();
		var sut = new RenameConfigItemHandler(processor);
		var projectId = Guid.NewGuid();
		var configItemId = Guid.NewGuid();
		var key = ConfigKey.Create("RENAMED_SECRET");

		await sut.HandleAsync(new RenameConfigItemCommand(projectId, configItemId, key), CancellationToken.None);

		var batch = Assert.IsType<ExecuteBatchCommand>(processor.CapturedCommand);
		Assert.Equal(projectId, batch.ProjectId);
		Assert.Null(batch.EnvironmentName);
		var operation = Assert.IsType<RenameItem>(Assert.Single(batch.Batch.Operations));
		Assert.Equal(configItemId, operation.ConfigItemId);
		Assert.Equal(key, operation.Key);
	}

	[Fact]
	public async Task RemoveConfigItem_ShouldDispatch_DeleteOperation()
	{
		var processor = new CapturingProcessor();
		var sut = new RemoveConfigItemHandler(processor);
		var projectId = Guid.NewGuid();
		var configItemId = Guid.NewGuid();

		await sut.HandleAsync(new RemoveConfigItemCommand(projectId, configItemId), CancellationToken.None);

		var batch = Assert.IsType<ExecuteBatchCommand>(processor.CapturedCommand);
		Assert.Equal(projectId, batch.ProjectId);
		Assert.Null(batch.EnvironmentName);
		var operation = Assert.IsType<DeleteItem>(Assert.Single(batch.Batch.Operations));
		Assert.Equal(configItemId, operation.ConfigItemId);
	}

	[Fact]
	public async Task SetConfigValue_ShouldDispatch_SetValueOperation()
	{
		var processor = new CapturingProcessor();
		var sut = new SetConfigValueHandler(processor);
		var projectId = Guid.NewGuid();
		var configItemId = Guid.NewGuid();

		await sut.HandleAsync(new SetConfigValueCommand(projectId, configItemId, "production", "secret"), CancellationToken.None);

		var batch = Assert.IsType<ExecuteBatchCommand>(processor.CapturedCommand);
		Assert.Equal(projectId, batch.ProjectId);
		Assert.Equal("production", batch.EnvironmentName);
		var operation = Assert.IsType<SetValue>(Assert.Single(batch.Batch.Operations));
		Assert.Equal(configItemId, operation.ConfigItemId);
		Assert.Equal("secret", operation.Value);
	}

	private sealed class CapturingProcessor : IProcessor
	{
		public object? CapturedCommand { get; private set; }

		public Task ExecuteAsync(ExecuteBatchCommand command, CancellationToken ct)
		{
			CapturedCommand = command;
			return Task.CompletedTask;
		}
	}
}
