namespace KeyVault.Application.Exceptions;

public class NotFoundException(string message) : AppException(message);