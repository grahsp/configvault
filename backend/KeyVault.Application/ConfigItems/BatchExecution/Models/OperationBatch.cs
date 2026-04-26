namespace KeyVault.Application.ConfigItems.BatchExecution.Models;

public sealed class OperationBatch
{
	public IReadOnlyList<Operation> Operations { get; }
	public string? EnvironmentName { get; }

	public OperationBatch(IEnumerable<Operation> operations, string? environmentName = null)
	{
		ArgumentNullException.ThrowIfNull(operations);

		var ops = operations.ToList();

		if (ops.Count == 0)
			throw new InvalidBatchOperationException("Batch must contain at least one operation.");

		Operations = ops;
		EnvironmentName = environmentName;

		Validate();
	}

	private void Validate()
	{
		var requiresEnvironment = Operations.Any(o => o.RequiresEnvironment);

		if (requiresEnvironment && string.IsNullOrWhiteSpace(EnvironmentName))
			throw new InvalidBatchOperationException("Environment must be provided for operations that require it.");
	}
}