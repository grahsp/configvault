using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Application.ConfigItems.Queries.GetExportedValues;

namespace KeyVault.Application.ConfigItems.Commands.CreateImportedItems;

public sealed record Command(Guid ProjectId, string EnvironmentName, IEnumerable<ConfigKeyValue> KeyValues) : ICommand<Unit>;