namespace KeyVault.Application.ConfigItems.BatchExecution;

public abstract class BatchOperationException(string message) : Exception(message);

public sealed class InvalidBatchOperationException(string message) : BatchOperationException(message);
