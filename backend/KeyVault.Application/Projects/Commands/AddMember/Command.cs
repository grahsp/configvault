using KeyVault.Application.Abstractions.Messaging;
using KeyVault.Domain.Identity;

namespace KeyVault.Application.Projects.Commands.AddMember;

public sealed record Command(Guid ProjectId, UserId UserId) : ICommand<Unit>;
