namespace KeyVault.Application.ConfigItems.BatchExecution.Models;

public abstract record Operation
{
	public abstract bool RequiresEnvironment { get; }
}