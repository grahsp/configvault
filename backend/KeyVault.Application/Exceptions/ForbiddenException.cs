namespace KeyVault.Application.Exceptions;

public class ForbiddenException(string message) : AppException(message);