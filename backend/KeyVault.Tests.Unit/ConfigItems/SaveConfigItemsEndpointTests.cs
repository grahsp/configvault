using System.Reflection;
using KeyVault.Api.ConfigItems.SaveConfigItems;
using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.BatchExecution.Models;
using BatchCommand = KeyVault.Application.ConfigItems.Commands.BatchOperations.Command;
using KeyVault.Application.Exceptions;
using KeyVault.Domain.ConfigItems;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using MessagingUnit = KeyVault.Application.Abstractions.Messaging.Unit;

namespace KeyVault.Tests.Unit.ConfigItems;

public sealed class SaveConfigItemsEndpointTests
{
	[Fact]
	public async Task Handle_ShouldMapLegacyRequest_ToOrderedOperations()
	{
		var dispatcher = new CapturingCommandDispatcher();
		var projectId = Guid.NewGuid();
		var configItemId = Guid.NewGuid();
		var deleteId = Guid.NewGuid();
		var request = new Request(
			"development",
			[
				new ConfigItemUpdateRequest(configItemId, "RENAMED_SECRET", "secret")
			],
			[deleteId]);

		var result = await InvokeHandleAsync(dispatcher, projectId, request);

		Assert.IsType<NoContent>(result);
		var command = Assert.IsType<BatchCommand>(dispatcher.CapturedCommand);
		Assert.Equal(projectId, command.ProjectId);
		Assert.Equal("development", command.Batch.EnvironmentName);
		Assert.Collection(
			command.Batch.Operations,
			operation =>
			{
				var rename = Assert.IsType<RenameItem>(operation);
				Assert.Equal(configItemId, rename.ConfigItemId);
				Assert.Equal(ConfigKey.Create("RENAMED_SECRET"), rename.Key);
			},
			operation =>
			{
				var setValue = Assert.IsType<SetValue>(operation);
				Assert.Equal(configItemId, setValue.ConfigItemId);
				Assert.Equal("secret", setValue.Value);
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
		var request = new Request(
			"development",
			[
				new ConfigItemUpdateRequest(Guid.NewGuid(), "not valid", null)
			],
			[]);

		await Assert.ThrowsAsync<ValidationException>(() => InvokeHandleAsync(dispatcher, Guid.NewGuid(), request));
		Assert.Null(dispatcher.CapturedCommand);
	}

	private static async Task<IResult> InvokeHandleAsync(
		ICommandDispatcher dispatcher,
		Guid projectId,
		Request request)
	{
		var endpointType = typeof(Request).Assembly.GetType("KeyVault.Api.ConfigItems.SaveConfigItems.Endpoint")
			?? throw new InvalidOperationException("SaveConfigItems endpoint type not found.");
		var handle = endpointType.GetMethod(
			"Handle",
			BindingFlags.Static | BindingFlags.NonPublic,
			[
				typeof(ICommandDispatcher),
				typeof(Guid),
				typeof(Request),
				typeof(CancellationToken)
			])
			?? throw new InvalidOperationException("SaveConfigItems endpoint handler not found.");

		var task = (Task<IResult>)handle.Invoke(null, [dispatcher, projectId, request, CancellationToken.None])!;
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
