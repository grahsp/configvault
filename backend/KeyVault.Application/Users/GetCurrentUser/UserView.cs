namespace KeyVault.Application.Users.GetCurrentUser;

public sealed record UserView(string Id, string? Email, string? DisplayName, DateTimeOffset CreatedAt);
