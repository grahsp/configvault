using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.BatchExecution.Models;

namespace KeyVault.Application.ConfigItems.Commands.BatchOperations;

public sealed record Command(Guid ProjectId, OperationBatch Batch ) : ICommand<Unit>;