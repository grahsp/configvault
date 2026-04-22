using KeyVault.Application.Exceptions;
using KeyVault.Domain.ConfigItems;

namespace KeyVault.Application.ConfigItems.Exceptions;

public sealed class ConfigItemAlreadyExistsException(ConfigKey key)
	: ValidationException($"Config item with key '{key}' already exists in project.");
