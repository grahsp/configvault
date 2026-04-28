using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Domain.Identity;
using KeyVault.Domain.Projects;

namespace KeyVault.Application.Projects.Commands.SetRole;

public sealed record Command(Guid ProjectId, UserId TargetUserId, ProjectRole Role) : ICommand<Unit>;
