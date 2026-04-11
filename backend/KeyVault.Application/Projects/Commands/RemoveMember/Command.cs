using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.Projects.Commands.RemoveMember;

public sealed record Command(Guid ProjectId, Guid UserId) : ICommand<Unit>;