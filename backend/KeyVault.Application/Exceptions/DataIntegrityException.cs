namespace KeyVault.Application.Exceptions;

public sealed class DataIntegrityException(string message) : PersistenceException(message);
