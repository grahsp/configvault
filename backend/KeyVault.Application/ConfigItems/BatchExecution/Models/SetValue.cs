namespace KeyVault.Application.ConfigItems.BatchExecution.Models;

public sealed record SetValue(Guid ConfigItemId, string Value) : Operation
{
	public override bool RequiresEnvironment => true;
}