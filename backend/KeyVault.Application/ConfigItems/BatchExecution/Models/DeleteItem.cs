namespace KeyVault.Application.ConfigItems.BatchExecution.Models;

public sealed record DeleteItem(Guid ConfigItemId) : Operation
{
	public override bool RequiresEnvironment => false;
}