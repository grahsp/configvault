using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Projects.Commands.SetRole;

public sealed record Command(Guid ProjectId, Guid UserId, ProjectRole Role) : ICommand<Unit>;