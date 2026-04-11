using KeyVault.Application.Abstractions.Messaging;

namespace KeyVault.Application.Projects.Commands.AddMember;

public sealed record Command(Guid ProjectId, Guid UserId) : ICommand<Unit>;