namespace KeyVault.Application.Users.GetCurrentUser;

public sealed record UserView(string Id, string? DisplayName, string Status, DateTimeOffset CreatedAt);