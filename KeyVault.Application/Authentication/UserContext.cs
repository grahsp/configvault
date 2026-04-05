namespace KeyVault.Application.Authentication;

public sealed record UserContext(string Issuer, string Subject, string? Email, string? Name);