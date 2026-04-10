namespace KeyVault.Application.Users.GetCurrentUser;

public sealed record UserView(Guid Id, string? DisplayName, string Status, DateTimeOffset CreatedAt);