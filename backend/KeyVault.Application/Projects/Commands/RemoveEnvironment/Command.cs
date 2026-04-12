using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.Projects.Commands.RemoveEnvironment;

public sealed record Command(Guid ProjectId, Guid EnvironmentId) : ICommand<Unit>;