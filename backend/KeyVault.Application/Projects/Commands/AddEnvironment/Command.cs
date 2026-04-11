using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.Projects.Commands.AddEnvironment;

public sealed record Command(Guid ProjectId, string EnvironmentName) : ICommand<Unit>;