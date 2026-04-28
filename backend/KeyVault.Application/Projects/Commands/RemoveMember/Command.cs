using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Domain.Identity;

namespace KeyVault.Application.Projects.Commands.RemoveMember;

public sealed record Command(Guid ProjectId, UserId TargetUserId) : ICommand<Unit>;
