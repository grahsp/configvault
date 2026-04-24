using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.Exceptions;
using KeyVault.Domain.ConfigItems;

namespace KeyVault.Application.ConfigItems.Commands.ExecuteBatchOperations;

public sealed record Command(
	Guid ProjectId,
	string? EnvironmentName,
	BatchRequest Batch
) : ICommand<Unit>
{
	public void Validate()
	{
		if (Batch.Operations.Any(operation => operation.RequiresEnvironment) &&
		    string.IsNullOrWhiteSpace(EnvironmentName))
		{
			throw new ValidationException("Environment is required for one or more batch operations.");
		}
	}
}

public sealed record BatchRequest(IReadOnlyList<Operation> Operations);

public abstract record Operation
{
	public abstract bool RequiresEnvironment { get; }
}

public sealed record CreateItem(ConfigKey Key, string? InitialValue) : Operation
{
	public override bool RequiresEnvironment => InitialValue is not null;
}

public sealed record RenameItem(Guid ConfigItemId, ConfigKey Key) : Operation
{
	public override bool RequiresEnvironment => false;
}

public sealed record DeleteItem(Guid ConfigItemId) : Operation
{
	public override bool RequiresEnvironment => false;
}

public sealed record SetValue(Guid ConfigItemId, string Value) : Operation
{
	public override bool RequiresEnvironment => true;
}
