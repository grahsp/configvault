using System.Reflection;
using KeyVault.Api.ConfigItems;
using KeyVault.Api.ConfigItems.BatchOperations.Operations;
using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.BatchExecution.Models;
using KeyVault.Application.ConfigItems.BatchExecution.Operations;
using BatchCommand = KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperationsCommand;
using KeyVault.Application.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using MessagingUnit = KeyVault.Application.Abstractions.Messaging.Unit;

namespace KeyVault.Tests.Unit.ConfigItems;

public sealed class BatchOperationsEndpointTests
{
	[Fact]
	public async Task Handle_ShouldDispatchOrderedOperations()
	{
		var dispatcher = new CapturingCommandDispatcher();
		var projectId = Guid.NewGuid();
		var configItemId = Guid.NewGuid();
		var deleteId = Guid.NewGuid();
		var request = new BatchOperationsRequest(
			"development",
			[
				new CreateConfigItemRequest("NEW_SECRET", "initial-secret"),
				new RenameConfigItemRequest(configItemId, "RENAMED_SECRET"),
				new SetConfigItemValueRequest(configItemId, "secret", 3),
				new DeleteConfigItemRequest(deleteId),
			]);

		var result = await InvokeHandleAsync(dispatcher, projectId, request);

		Assert.IsType<NoContent>(result);
		var command = Assert.IsType<BatchCommand>(dispatcher.CapturedCommand);
		Assert.Equal(projectId, command.ProjectId);
		Assert.Equal("development", command.Batch.EnvironmentName);
		Assert.Collection(
			command.Batch.Operations,
			operation =>
			{
				var create = Assert.IsType<CreateItem>(operation);
				Assert.Equal(KeyVault.Domain.ConfigItems.ConfigKey.Create("NEW_SECRET"), create.Key);
				Assert.Equal("initial-secret", create.InitialValue);
			},
			operation =>
			{
				var rename = Assert.IsType<RenameItem>(operation);
				Assert.Equal(configItemId, rename.ConfigItemId);
				Assert.Equal(KeyVault.Domain.ConfigItems.ConfigKey.Create("RENAMED_SECRET"), rename.Key);
			},
			operation =>
			{
				var setValue = Assert.IsType<SetValue>(operation);
				Assert.Equal(configItemId, setValue.ConfigItemId);
				Assert.Equal("secret", setValue.Value);
				Assert.Equal(3u, setValue.ExpectedRevision);
			},
			operation =>
			{
				var delete = Assert.IsType<DeleteItem>(operation);
				Assert.Equal(deleteId, delete.ConfigItemId);
			});
	}

	[Fact]
	public async Task Handle_ShouldThrowValidationException_ForInvalidKey()
	{
		var dispatcher = new CapturingCommandDispatcher();
		var request = new BatchOperationsRequest(
			"development",
			[
				new CreateConfigItemRequest("not valid", null),
			]);

		await Assert.ThrowsAsync<ValidationException>(() => InvokeHandleAsync(dispatcher, Guid.NewGuid(), request));
		Assert.Null(dispatcher.CapturedCommand);
	}

	[Fact]
	public async Task Handle_ShouldThrowValidationException_ForInvalidRenameKey()
	{
		var dispatcher = new CapturingCommandDispatcher();
		var request = new BatchOperationsRequest(
			"development",
			[
				new RenameConfigItemRequest(Guid.NewGuid(), "not valid"),
			]);

		await Assert.ThrowsAsync<ValidationException>(() => InvokeHandleAsync(dispatcher, Guid.NewGuid(), request));
		Assert.Null(dispatcher.CapturedCommand);
	}

	private static async Task<IResult> InvokeHandleAsync(
		ICommandDispatcher dispatcher,
		Guid projectId,
		BatchOperationsRequest request)
	{
		var endpointType = typeof(BatchOperationsRequest).Assembly.GetType("KeyVault.Api.ConfigItems.BatchOperationsEndpoint")
			?? throw new InvalidOperationException("BatchOperations endpoint type not found.");
		var handle = endpointType.GetMethod(
			"Handle",
			BindingFlags.Static | BindingFlags.NonPublic,
			[
				typeof(BatchOperationsRequest),
				typeof(ICommandDispatcher),
				typeof(Guid),
				typeof(CancellationToken)
			])
			?? throw new InvalidOperationException("BatchOperations endpoint handler not found.");

		var task = (Task<IResult>)handle.Invoke(null, [request, dispatcher, projectId, CancellationToken.None])!;
		return await task;
	}

	private sealed class CapturingCommandDispatcher : ICommandDispatcher
	{
		public object? CapturedCommand { get; private set; }

		public Task<TResponse> DispatchAsync<TResponse>(ICommand<TResponse> command, CancellationToken ct = default)
		{
			CapturedCommand = command;
			return Task.FromResult((TResponse)(object)MessagingUnit.Value);
		}
	}
}
